To run server successfully, you have to install graphicsmagick, imagemagick and ffmpeg firstly. 

In Mac OS X, run 
`brew install graphicsmagick`
`brew install ffmpeg --with-faac`

In Ubuntu, run

```
sudo add-apt-repository ppa:kirillshkrogalev/ffmpeg-next
sudo apt-get update
sudo apt-get install ffmpeg --with-faac
```

Also run install_ffmpeg_ubuntu.sh script that's included in renderer.