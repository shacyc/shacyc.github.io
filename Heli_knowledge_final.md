# Install Centos 7 minimal
- Create user **k8s**
- set host name

```console
hostnamectl set-hostname cluster01
```

- Run init.sh

```console
# update
yum install epel-release -y
yum update -y

# utilities
yum install ntp ntpdate rsync htop net-tools wget telnet -y

# turn off firewall
service firewalld stop
systemctl disable firewalld

# set enforce
setenforce 0
sed -i 's/enforcing/disabled/g' /etc/selinux/config /etc/selinux/config

# update date time
ntpdate -u -s 0.centos.pool.ntp.org 1.centos.pool.ntp.org 2.centos.pool.ntp.org

```

# Docker

- [Install docker](https://docs.docker.com/engine/install/centos/)

```console
yum install -y yum-utils

yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

# Install version 19.03 for rke version 1.2.4
yum install docker-ce-19.03.9 docker-ce-cli-19.03.9 containerd.io -y

# remove bản cũ
# yum remove docker-* -y
# cài bản mới, từ program có sẵn
# curl https://releases.rancher.com/install-docker/19.03.sh | sh

systemctl enable docker

```

# SSH
- Clone 2 more VM
- On 3 cluster

```console
su - k8s
ssh-keygen
```
- On VM 1, pull ssh from all 3 VM

```console
su - k8s
ssh-copy-id k8s@[ip cluster 1]
ssh-copy-id k8s@[ip cluster 2]
ssh-copy-id k8s@[ip cluster 3]
```

- Add docker permission to account k8s

```console
su
usermod -aG docker k8s
```

# RKE

- Download rke

```console
su - k8s
mkdir Downloads
cd Downloads/
wget https://github.com/rancher/rke/releases/download/v1.2.4/rke_linux-amd64
mv rke_linux-amd64 rke
chmod +x rke
cp rke /usr/bin
```

- Create yml file
```console
cd /home/k8s
vi cluster.yml
```

```console
nodes:
  - address: 192.168.25.141
    internal_address: 192.168.25.141
    user: k8s
    role: [controlplane, worker, etcd]
  - address: 192.168.25.142
    internal_address: 192.168.25.142
    user: k8s
    role: [controlplane, worker, etcd]
  - address: 192.168.25.143
    internal_address: 192.168.25.143
    user: k8s
    role: [controlplane, worker, etcd]

services:
  etcd:
    snapshot: true
    creation: 6h
    retention: 24h

# Required for external TLS termination with
# ingress-nginx v0.22+
ingress:
  provider: nginx
  options:
    use-forwarded-headers: "true"
```

- Run rke

```Console
rke up cluster.yml
```

# Kubectl

- [Install kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
```console
curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x ./kubectl
su
mv ./kubectl /usr/bin/
su - k8s
kubectl version --client
export KUBECONFIG=$(pwd)/kube_config_cluster.yml
cat KUBECONFIG=$(pwd)/kube_config_cluster.yml
```

- Copy config file to other VM
```console
rsync kube_config_cluster.yml k8s@192.168.25.142:/home/k8s
rsync kube_config_cluster.yml k8s@192.168.25.143:/home/k8s
```

- Edit kube_config_cluster on 3 VM, change IP to it's VM ip

# Rancher

- Install rancher
```console
docker run -d --restart=unless-stopped -p 9080:80 -p 9443:443 -v /opt/docker_rancher:/var/lib/rancher rancher/rancher:v2.4.8
```

- go to https://192.168.25.141:9443/ > add cluster > import an existing cluster
- named cluster master > next
- run 2 last command on cluster 1
- If can not run command
    - copy content from url. eg: https://192.168.25.141:9443/v3/import/qmwnfc8lqxsgqk9zhsp9wf4nb2lnlljqpxr9df2jk52dbb2w5bmwdr.yaml
```console
su - k8s
vi config.yml
# parse content from file
kubectl apply -f config.yml
```

