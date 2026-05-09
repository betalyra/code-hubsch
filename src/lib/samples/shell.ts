import type { Language } from '#/lib/types'

export const SHELL_SAMPLES: Partial<Record<Language, ReadonlyArray<string>>> = {
  bash: [
    `#!/usr/bin/env bash
set -euo pipefail

NAME=$1
COUNT=\${2:-3}

if [ -d "./build" ]; then
  echo "build exists"
else
  mkdir -p build
fi

for i in $(seq 1 $COUNT); do
  echo "iteration $i for $NAME"
done

function deploy() {
  local target=$1
  rsync -avz ./dist/ "$target" || exit 1
}

cat /etc/os-release | grep VERSION
ls -la build/ && find . -name "*.log"
export PATH="$PATH:/usr/local/bin"
`,
  ],
  powershell: [
    `[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [string]$Name,
  [int]$Count = 3
)

function Get-Greeting {
  param([string]$Who)
  return "Hello, $Who!"
}

$ErrorActionPreference = "Stop"

if (Test-Path -Path ".\\build") {
  Write-Host "build exists"
} else {
  New-Item -ItemType Directory -Path ".\\build" | Out-Null
}

1..$Count | ForEach-Object {
  Write-Host "iteration $_ for $Name"
}

Get-ChildItem -Recurse -Filter "*.log" |
  Where-Object { $_.Length -gt 0 } |
  Select-Object FullName, Length |
  Sort-Object Length -Descending
`,
  ],
  docker: [
    `# syntax=docker/dockerfile:1.6
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
ENV NODE_ENV=production
HEALTHCHECK --interval=30s CMD wget -q -O- http://localhost/ || exit 1
USER nginx
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
`,
  ],
  makefile: [
    `# Build rules for the project
.PHONY: all build test clean fmt

CC := gcc
CFLAGS := -Wall -O2
SRC := $(wildcard src/*.c)
OBJ := $(SRC:.c=.o)

all: build

build: $(OBJ)
\t$(CC) $(CFLAGS) -o app $(OBJ)

%.o: %.c
\t$(CC) $(CFLAGS) -c $< -o $@

test: build
\t./app --test

clean:
\trm -f $(OBJ) app

fmt:
\tclang-format -i $(SRC)

include config.mk

SHELL := /bin/bash
`,
  ],
  hcl: [
    `terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

variable "region" {
  type    = string
  default = "us-east-1"
}

resource "aws_s3_bucket" "logs" {
  bucket = "my-app-logs-\${var.region}"
  tags = {
    Environment = "prod"
    Owner       = "team-platform"
  }
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  cidr   = "10.0.0.0/16"
}

output "bucket_name" {
  value = aws_s3_bucket.logs.bucket
}

data "aws_caller_identity" "current" {}
`,
  ],
}
