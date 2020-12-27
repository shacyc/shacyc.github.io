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
- Settings > Keyboard > Customize shortcut
  - Launcher > Home Folder > Super + E
  - Launcher > Launch Email Client > Disable
  - Navigate applications and windows > Launch and switch applications: Super + S
  - Navigation > Hide all normal windows > Super + D
  - 

## Applications
- Pop!_Shop
  - VLC
  - Tilix
    - Set default terminal: *update-alternatives --config x-terminal-emulator*

- [ibus-teni](https://github.com/teni-ime/ibus-teni)
```console
add-apt-repository ppa:teni-ime/ibus-teni
apt-get update
apt-get install ibus-teni
usermod -a -G input $USER
```

- [Visual Studio Code](https://code.visualstudio.com/download)

- [Ulauncher](https://ulauncher.io/) or using Super + / for replacement

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

- [Neofetch](https://github.com/dylanaraps/neofetch)
```console
apt install neofetch
```

- [Balena Etcher](https://www.balena.io/etcher/)
