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

## Haproxy
### install
yum install haproxy
### backup
cd /etc/haproxy/
cp haproxy.cfg haproxy.<<backup date>>.cfg
