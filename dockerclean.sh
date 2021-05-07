#!/bin/bash
docker rm $(docker ps -aq)
docker rmi $(docker images | grep "^<none>" | awk '{print $3}')