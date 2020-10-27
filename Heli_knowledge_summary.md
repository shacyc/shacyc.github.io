## After install
sudo yum install epel-release -y
sudo yum update -y

yum install ntp ntpdate rsync htop net-tools wget telnet -y
ntp: sync time (server)
ntpdate: sync time (client)
rsync: sync copy file between servers
htop: view system monitors
net-tools: ipconfig,...
wget: 

### rename host
hostnamectl set-hostname <<hostname>>

## Haproxy
### install
yum install haproxy
### backup
cd /etc/haproxy/
cp haproxy.cfg haproxy.<<backup date>>.cfg
  
## Nginx
### install
yum install nginx
### create web folder
mkdir -p /home/www/nginx_demo
touch index.html
### create config
touch /etc/nginx/conf.d/nginx_demo.conf

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

#### start
service firewall stop
set enforce 0
