#!/bin/bash

ansible-playbook -i  host setup.yaml

ansible-playbook -i  host webserver.yaml

ansible-playbook -i host replica.yaml