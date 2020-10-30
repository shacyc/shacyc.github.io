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

sudo EXTERNAL_URL="http://gitlab.localdomain" yum install -y gitlab-ee
```

## Struct
- Root
- - Group
- - - Project
- - Repo
- - - Project

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
- Please enter the executor: ***shell**
