## After install
- Install gnome tweaks
```console
apt-get install gnome-tweak-tool
```

- Install java
```console
atp install default-jdk
```

## Settings

- Settings > Accessibility > Large Text
- Settings > Display > Night Light
- Settings > Power > Show Battery Percentage
- Tweaks > Window Titlebars > Titlebar Buttons
  - Maximize
  - Minimize

## Applications
- Pop!_Shop
  - VLC

- ibus-teni
```console
add-apt-repository ppa:teni-ime/ibus-teni
apt-get update
apt-get install ibus-teni
usermod -a -G input $USER
```

- [Visual Studio Code](https://code.visualstudio.com/download)

- [Ulauncher](https://ulauncher.io/)

- Xtreme Download Manager

  - Download [XDMan](http://xdman.sourceforge.net/#downloads)
  - Run script
```console
mkrid xdm
mv xdm-setup-7.2.11.tar.xz xdm
cd xdm
tar xvf xdm-setup-7.2.11.tar.xz
./install.sh
```

- [VMWare](https://www.vmware.com/products/workstation-pro/workstation-pro-evaluation.html)
  - Download .bundle from wmware website
  - Execute
```console
apt install gcc build-essential

cd /home/tasterisk/Downloads/
chmod +x VMware-Workstation-Full-16.1.0-17198959.x86_64.bundle
./VMware-Workstation-Full-16.1.0-17198959.x86_64.bundle
```
> VMWare 16 key: ZF71R-DMX85-08DQY-8YMNC-PPHV8
