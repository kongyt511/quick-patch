# quick-patch README

快速真机调试扩展

## Features


## Requirements

adb

## Extension Settings
This extension contributes the following settings:

* `quick_patch.adb_path`: [Android独有] adb工具路径(默认是"adb"，需要在系统环境变量PATH中设置，也可以是绝对路径)
* `quick_patch.ifuse_path`: [IOS独有] ifuse工具路径(默认是"ifuse"，需要在系统环境变量PATH中设置，也可以是绝对路径)
* `quick_patch.dest_path_android`: [Android独有]补丁推送的目的路径(默认是"/storage/emulated/0/Android/data/xxxxxx/files", 请替换成你自己的目录)
* `quick_patch.bundle_id`: [IOS独有] App Bundle Id
* `quick_patch.patch_dir`: 补丁根目录(默认是"debug")
* `quick_patch.scripts_dir`: 脚本根目录(默认是"Scripts")

## Known Issues
## Release Notes
### 0.0.1
首次发布

**Enjoy!**
