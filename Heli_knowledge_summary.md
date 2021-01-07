# Installation

## install repo, software

#### Install *repository* and *update*
```console
sudo yum install epel-release -y  
sudo yum update -y
```

#### Install neccessary software
```console
yum install ntp ntpdate rsync htop net-tools wget telnet -y
```
- ntp: sync time (server)
- ntpdate: sync time (client)
- rsync: sync copy file between servers
- htop: view system monitors
- net-tools: ipconfig,...
- wget: download file from internet
- telnet: telnet

#### Rename host
```console
hostnamectl set-hostname <<host name>>
```

#### SSH

###### get ip
```console
ip a
```
###### install mobaxterm
[Get MobaXterm](https://mobaxterm.mobatek.net/download.html)

# Load balancing

## Haproxy

#### install
```console
yum install haproxy
```

#### backup config
cd /etc/haproxy/
cp haproxy.cfg haproxy.<<backup date>>.cfg
  
#### config explaination

```ini
#---------------------------------------------------------------------
# Example configuration for a possible web application.  See the
# full configuration options online.
#
#   http://haproxy.1wt.eu/download/1.4/doc/configuration.txt
#
#---------------------------------------------------------------------

#---------------------------------------------------------------------
# Global settings
#---------------------------------------------------------------------
global
    # to have these messages end up in /var/log/haproxy.log you will
    # need to:
    #
    # 1) configure syslog to accept network log events.  This is done
    #    by adding the '-r' option to the SYSLOGD_OPTIONS in
    #    /etc/sysconfig/syslog
    #
    # 2) configure local2 events to go to the /var/log/haproxy.log
    #   file. A line like the following can be added to
    #   /etc/sysconfig/syslog
    #
    #    local2.*                       /var/log/haproxy.log
    #
    log         127.0.0.1 local2

    chroot      /var/lib/haproxy
    pidfile     /var/run/haproxy.pid
    maxconn     4000
    user        haproxy
    group       haproxy
    daemon

    # turn on stats unix socket
    stats socket /var/lib/haproxy/stats

#---------------------------------------------------------------------
# common defaults that all the 'listen' and 'backend' sections will
# use if not designated in their block
#---------------------------------------------------------------------
defaults
    mode                    http
    log                     global
    option                  httplog
    option                  dontlognull
    option http-server-close
    option forwardfor       except 127.0.0.0/8
    option                  redispatch
    retries                 3
    timeout http-request    10s
    timeout queue           1m
    timeout connect         10s
    timeout client          1m
    timeout server          1m
    timeout http-keep-alive 10s
    timeout check           10s
    maxconn                 3000

#---------------------------------------------------------------------
# main frontend which proxys to the backends
#---------------------------------------------------------------------
frontend  main *:5000
    acl url_static       path_beg       -i /static /images /javascript /stylesheets
    acl url_static       path_end       -i .jpg .gif .png .css .js

    use_backend static          if url_static
    default_backend             app

#---------------------------------------------------------------------
# static backend for serving up images, stylesheets and such
#---------------------------------------------------------------------
backend static
    balance     roundrobin
    server      static 127.0.0.1:4331 check

#---------------------------------------------------------------------
# round robin balancing between the various backends
#---------------------------------------------------------------------
backend app
    balance     roundrobin
    server  app1 127.0.0.1:5001 check
    server  app2 127.0.0.1:5002 check
    server  app3 127.0.0.1:5003 check
    server  app4 127.0.0.1:5004 check
```
- frontend: which request haproxy process
- backend: where requets will be forwarded

# Web server
 
## Nginx

#### install

```console
yum install nginx
```

#### create web folder

```console
mkdir -p /home/www/<<site name>>
touch index.html
```

#### set config
###### create config file
```console
touch /etc/nginx/conf.d/<<site name>>.conf
```
###### config
```javascript
server {
    listen 8094;
    server_name huongdan.helisoft.vn;
    access_log /var/log/nginx/huongdan-access.log;
    error_log /var/log/nginx/huongdan-error.log;
    root /home/www/huongdan;

    index index.html;

    location ~* \.(jpg|jpeg|png|gif|ico)$ {
       expires 30d;
    }

    location ~* \.(css|js)$ {
       expires 7d;
    }

    location /404.html {
        return 404 '404';
        add_header Content-Type text/plain;
    }

    location /429.html {
        return 429 '429';
        add_header Content-Type text/plain;
    }

    location /500.html {
        return 500 '500';
        add_header Content-Type text/plain;
    }

    location /503.html {
        return 503 '503';
        add_header Content-Type text/plain;
    }

    location /504.html {
        return 504 '504';
        add_header Content-Type text/plain;
    }
}
```

#### start web server
###### firewall
stop firewall or open port
```console
service firewall stop
```
``` console
firewall-cmd --permanent --add-port=8094/tcp
firewall-cmd --reload
```
When using nginx, we have to disable SELinux
```console
setenforce 0
sed -i 's/enforcing/disabled/g' /etc/selinux/config /etc/selinux/config
```
###### start
```console
service nginx start
```

# Virtual IP (VIP)

## Keep alived
#### install
```console
yum install psmisc keepalived -y
```

#### config
```console
vi /etc/keepalived/keepalived.conf
```

```javascript
vrrp_script chk_haproxy {           # Requires keepalived-1.1.13
        script "killall -0 haproxy"     # cheaper than pidof
        interval 2                      # check every 2 seconds
        #weight 2                        # add 2 points of prio if OK
        fall 2
        rise 2
}

vrrp_instance VI_1 {
        interface enp1s0
        state MASTER
        virtual_router_id 51
        priority 101   # 101 on master, 100 on backup
        virtual_ipaddress {
            192.168.122.6/24
        }
        track_script {
            chk_haproxy
        }
}
```
###### script
- killall -0 haproxy: check haproxy alive or not
- weight x: if haproxy is die, add x into priority
###### instance
- interface: get ethernet interface from **ip a**
- state MASTER/BACKUP: check loadbalancing is master or backup
- priority: run minimun priority
- virtual_ipaddress: virtual ip use in all load balancer

#### start
```console
service keepalived start
```
# Gitlab

## Install
[Install gitlab on centos 7](https://about.gitlab.com/install/#centos-7)

```console
sudo yum install -y curl policycoreutils-python openssh-server
sudo systemctl enable sshd
sudo systemctl start sshd

sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo systemctl reload firewalld

sudo yum install postfix
sudo systemctl enable postfix
sudo systemctl start postfix

curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.rpm.sh | sudo bash

sudo EXTERNAL_URL="http://gitlab.local" yum install -y gitlab-ee
```

## Struct
- Root
  - Group
      - Project
  - Repo
      - Project

#### Group
- private: The group and its projects can only be viewed by members. (Usually use)
- internal: The group and any internal projects can be viewed by any logged in user.
- publish: The group and any public projects can be viewed without any authentication.

#### Project
###### Branch
- Master: only for maintain role
- Beta 
- Dev

# CI/CD
## Gitlab runner
#### install

[Intalling guide](https://docs.gitlab.com/runner/install/)

```console
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.rpm.sh | sudo bash
export GITLAB_RUNNER_DISABLE_SKEL=true; sudo -E yum install gitlab-runner
sudo gitlab-runner start
```
#### implement
- Gitlab -> Setting -> CI/CD -> expand Runner -> Specific Runners (**)

```console
gitlab-runner register
```
- Please enter the gitlab-ci coordinator URL: get from (**)
- Please enter the gitlab-ci token for this runner: get from (**)
- Please enter the gitlab-ci description for this runner: any description
- Please enter the gitlab-ci tags for this runner: partition by group or envirment ( dotnet, vue, ... )
- Please enter the executor: **shell**

#### config file

```console
cat /etc/gitlab-runner/config.toml
```

#### permission
Add per mission for gitlab-runner user
```console
groupadd docker
usermod -aG docker gitlab-runner
service docker restart
```

## .Net Core (Install docker first to avoid error)
#### install enviroment
```console
sudo rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm
sudo yum install dotnet-sdk-3.1 -y
```

#### .gitlab-ci.yaml
```console
stages:
  - build_master
build_test:     
  stage: build_master
  tags: 
    - dotnet  
  script: 
    - dotnet publish src/MvcDemo/MvcDemo.csproj -c Release -o  ./deploy/
  only:
    - master
```

# Docker
## Installation
```console
yum install docker
systemctl enable docker
```

## Commmon commands

#### Help
> docker [command] --help
```console
docker image --help
docker image save --help
```

#### Images
List all images
```console
docker images
```

Search images from [docker hub](https://hub.docker.com)
> docker search [keyword]
```console
docker search ubuntu
```

Pull image
> docker pull [image name]:[tag]
```console
docker pull busybox:latest
```

Remove image
Remove by name
> docker image rm [image name]:[tag]

Remove by Id  
> docker image rm [image's id some first letters]

```console
docker image rm busybox:latest
```

Run image  
> docker run [-it] [--name "ContainerName"] [-h hostname] [image]
- -it (-i -t): after container is created, terminal it
- --name "ContainerName": named container
- -h hostname: set container host name
- image: image name or id

```console
docker run -it busybox:lastest
```

Remove image
> docker image rm [image's id or image's name]
```console
docker image rm busybox:lastest
```

#### Container
List all running containers
```console
docker ps
```

List all containers (include stopped container)
```console
docker ps -a
```

Start container
> docker start [container's id or container's name]
```console
docker start container_name
```

Start container
> docker stop [container's id or container's name]
```console
docker stop container_name
```

Attach to a running container
> docker attach [container's id or container's name]
```console
docker attach container_name
```

Exit attaching
- exit: run command exit makes container stop
- Ctrl + P + Q: container won't be stopped

Remove container
> docker rm [-f] [container's id or container's name]
- -f: force remove, use when container's running
```console
docker rm container_name
```

Execute command
> docker exec [container's id or container's name] [command]
```console
docker exec container_name ls
```

#### Commit and load image

Commit container to image
> docker commit [container's id or container's name] [image name]:[tag]
```console
docker commit container_name busybox_custom:1.0
```

Save image to file
> docker save --output [file name] [image's id or image's name]
```console
docker save --output export_image.tar.gz busybox_custom:1.0
```

Load image from file
> docker load -i [file name]  
> docker tag [image's id or image's name] [image name]:[version]
```console
docker load -i export_image.tar.gz
docker tag import_image busybox_custom:2.0
```

#### Advance command

Remove all unused images ( to reduce storage for docker vm )
```console
docker system prune -af
```

## Docker volumn
#### create volumn
docker volumn
> docker volumn create [volumn name]
```console
docker volumn create docker_volumn
```

volumn mounted to host computer
> docker volumn create --opt device=[path to folder] --opt type=none --opt o=bind [volumn name]
```console
docker volumn create --opt device=/home/shared --opt type=none --opt o=bind shared_volumn
```

#### check volumn info
> docker volumn inspect [volumn name]
```console
docker volumn inspect shared_volumn
```

#### mount volumn on run container
docker volumn
> 
```console
docker run --name U1 --mount source=docker_volumn,target=/home/mounted_disk shared_volumn ubuntu:lastest
```

volumn in host computer
> docker run --name [container name]  -v [volumn name]:[mounted directory] [image name]:[tag]
```console
docker run --name U1 -v shared_volumn:/home/mounted_disk ubuntu:lastest
```


#### remove volumn
> docker volumn rm [volumn name]
```console
docker volumn rm volumn_name
```

#### list all volum
```console
docker volumn ls
```

## Docker network

#### show all network
```console
docker network ls
```
- bridge: all container will be connected to this network

#### inspect network
> docker network inspect [network name]
```console
docker network inspect bridge
```

#### create container with export port
> docker run --name [container's name] -p [port outside]:[port inside] [image's name]
```console
docker run --name container_name -p 8888:80 busybox
```

#### create bridge network
> docker network create --driver bridge [network's name]
```console
docker network create --driver bridge own_network
```

#### remove network
> docker network rm [network's name]
```console
docker network rm own_network
```

#### create container with created network
> docker run --name [container's name] --network [network's name] [image's name]
```console
docker run --name container_name --network own_network busybox
```

#### connect container to a network
> docker network connect [network's name] [container's name]
```console
docker network connect container_name own_network
```


## Registry
#### Install
```console
sudo yum install docker-distribution -y
```

#### Run
```console
service firewalld stop
service docker-distribution start
```

# Kubenetes + Rancher

## Download
- https://github.com/rancher/rke/releases/tag/v1.0.14
- Download rke_linux-amd64 via wget

```console
wget https://github.com/rancher/rke/releases/download/v1.2.4/rke_linux-amd64
mv rke_linux-amd64 rke
chmod +x rke
cp rke /usr/local/bin
```

- rename for easier call
- chmod: allow rke to execute
- cp: copy to use rke as command


## Setup
- https://rancher.com/docs/rancher/v2.x/en/installation/resources/k8s-tutorials/ha-rke/

#### create user
```console
adduser urancher
passwd urancher
```

#### disable firewall
```console
service firewalld stop
```

#### install rancher into docker
```console
sudo docker run -d --restart=unless-stopped -p 9080:80 -p 9443:443 -v /opt/rancher:/var/lib/rancher rancher/rancher:v2.4.8
```
- go to: https://192.168.25.135:9443/
- set root password
- default user name: admin

#### add cluster
- https://192.168.25.133:9443/g/clusters
- Add cluster -> From existings node
- named cluster
- next
- if this is master node, check etcd, control plane
- if this is woker, check worker
- copy command at step 2 and run it from terminal. This command will create container from kubenetes image
- back to web page -> go to nodes

# Cluster
## Installation
- [Install docker](https://docs.docker.com/engine/install/centos/)
- Set enforce, firewall
```console
setenforce 0
sed -i 's/enforcing/disabled/g' /etc/selinux/config /etc/selinux/config
service firewall stop
```
- Clone 2 more VM

- Cluster 1
  - Download rke
```console
wget https://github.com/rancher/rke/releases/download/v1.2.4/rke_linux-amd64
mv rke_linux-amd64 rke
chmod +x rke
cp rke /usr/bin
```

- 3 Cluster
  - Add user k8s and switch to user k8s and **set password for cluster 2 and 3**
```console
useradd k8s
su - k8s
passwd k8s
```
  - Add SSH Key to make 3 cluster can connect to other (enter to the end)
```console
ssh-keygen
```

- Cluster 1
  - copy ssh key from cluster 2 and 3
```console
ssh-copy-id k8s@[ip cluster 2]
ssh-copy-id k8s@[ip cluster 3]
```
