#!/bin/bash

pm2 stop 03-user || true
pm2 start build/pm2_local.yaml
