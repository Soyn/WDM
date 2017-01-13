const formidable = require('formidable');
const parse = require('co-body');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const randomstring = require('randomstring');
const handle = require('./handle.js')();



require('events').EventEmitter.prototype._maxListeners = 100; //设置最大为100，或置0取消


module.exports = {
  //主页
  homeInfo: function *() {
    const query = this.req.user;
    const rows = yield handle.handleHomeInfo(this, query);
    handle.sendRes(this, rows);
  },
  //分享页
  shareInfo: function *() {
    const query = this.query;
    const rows = yield handle.handleShareInfo(this, query);
    handle.sendRes(this, rows);
  },
  //上传文件
  upload: function *() {
    const { fields, files } = yield handle.parseFiles(this);

    if (files.files.length === 0) { //无文件上传
      const err = {
        message: '至少上传一个文件!'
      }
      handle.sendRes(this, err);
      return;
    }
    const exist = yield handle.pathIsExist(this, fields.path);
    if (!exist) { //目录错误
      const err = {
        message: '上传目录错误或不存在!'
      }
      handle.sendRes(this, err);
      return;
    }

    //更新数据库，响应体
    const res = yield handle.handleUpload(this, fields, files); 

    //响应
    handle.sendRes(this, res);
  },
  //上传文件夹
  uploadDir: function *() {

    const { fields, files } = yield handle.parseFiles(this);  //解析请求
    if (files.files.length === 0) { //无文件上传
      const err = {
        message: '至少上传一个文件!'
      }
      handle.sendRes(this, err);
      return;
    }
    const exist = yield handle.pathIsExist(this, fields.path);
    if (!exist) { //目录错误
      const err = {
        message: '上传目录错误或不存在!'
      }
      handle.sendRes(this, err);
      return;
    }

    //生成文件树
    const body = handle.dirTree(fields, files)
    //处理文件夹
    yield handle.handleUploadDir(this, body);
    handle.sendRes(this, body);
  },
  //下载文件
  download: function *() {
    //keys: array
    let keys = this.query.key;
    if (!Array.isArray(keys))
      keys = [keys];
    const body = {
      keys,
      u_id: this.req.user.u_id
    }

    const file = yield handle.getAllFiles(this, body);
    if (file.length === 1 && !file.isdir) { //单文件
      console.log(file[0]);
      const { d_dir, name } = yield handle.handleDownload(this, file[0]);
      //发送
      this.set('Content-disposition', 'attachment; filename=' + name);
      this.set('Content-type', mime.lookup(name));
      this.body = fs.createReadStream(d_dir);
    } else if (file.length === 0) { //文件不存在
      const err = {
        message: '目标文件不存在!'
      }
      handle.sendRes(this, err);
    } else { //多文件或文件夹
      //文件信息
      files = yield handle.searchFiles(this, file);
      //移除前缀
      handle.rmPrefix(files);
      //改写路径
      handle.rewritePath(files);
      //临时目录
      const tmp = fs.mkdtempSync(path.join(__dirname, '../public/download/'));
      //复制文件
      handle.copyFiles(files, tmp);
      //压缩文件
      const fileInfo = yield handle.zip(tmp);
      //发送文件
      handle.sendFile(this, fileInfo);
    }
  },
  //多文件下载
  downloadzip: function *() {
    const query = this.query;
    //文件信息
    const files = yield handle.searchFiles(this, query);
    //移除前缀
    handle.rmPrefix(files);
    //改写路径
    handle.rewritePath(files);
    //临时目录
    const tmp = fs.mkdtempSync(path.join(__dirname, '../public/download/'));
    //复制文件
    handle.copyFiles(files, tmp);
    //压缩文件
    const fileInfo = yield handle.zip(tmp);
    //发送文件
    handle.sendFile(this, fileInfo);
  },
  //重命名
  rename: function *() {
    const body = this.request.body;
    body.u_id = this.req.user.u_id;
    body.lasttime = new Date(Date.now() + (8 * 60 * 60 * 1000));
    const res = yield handle.handleRename(this, body);
    if(!res) { //返回为undefined，key错误或不存在
      const err = {
        message: '非法操作！'
      }
      handle.sendRes(this, err);
      return;
    }
    handle.sendRes(this, res);
    
  },
  //移动
  move: function *() {
    const body = this.request.body;
    body.u_id = this.req.user.u_id;
    body.lasttime = new Date(Date.now() + (8 * 60 * 60 * 1000));
    const exist = yield handle.pathIsExist(this, body.newPath);

    if (!exist) { //目录错误
      const err = {
        message: '移动目录错误或不存在!'
      }
      handle.sendRes(this, err);
      return;
    }

    let res = yield handle.handleMove(this, body); 
    if(!res) { //返回为undefined，key错误或不存在
      const err = {
        message: '非法操作！'
      }
      handle.sendRes(this, err);
      return;
    }

    if (body.isdir) {
      body.prePath += body.key + '/';
      body.newPath += body.key + '/';
      let res_dir = yield handle.handleMoveDir(this, body);
      res = [...res, ...res_dir];
    }
    

    handle.sendRes(this, res);
    
  },
  //删除
  delete: function *() {
    const body = this.request.body;
    body.u_id = this.req.user.u_id;
    yield handle.handleDelete(this, body);

    handle.sendRes(this, {done: true});
  },
  //新建文件夹
  mkdir: function *() {
    const body = this.request.body;
    
    const exist = yield handle.pathIsExist(this, body.path);
    if (!exist) { //目录错误
      const err = {
        message: '目录错误或不存在!'
      }
      handle.sendRes(this, err);
      return;
    }
    body.u_id = this.req.user.u_id;
    body.time = new Date(Date.now() + (8 * 60 * 60 * 1000));
    const res = yield handle.handleMkdir(this, body);
    handle.sendRes(this, res);
  },
  //分享
  share: function *() {
    //拿到key
    const body = this.request.body; 
    //拿到记录
    let rows = yield handle.searchFiles(this, body); 
    //移除前缀
    handle.rmPrefix(rows); 
    //构造handleShare所需的信息
    const result = {
      u_id: 0,
      addr: randomstring.generate(10),
      secret: (!!+body.isSecret) ? randomstring.generate(6) : null,
      rows
    }
    //添加share表
    const { addr, secret } = yield handle.handleShare(this, result); 
    //响应信息
    const res = {
      addr,
      secret
    }
    //响应
    handle.sendRes(this, res);
  },
  //取消分享
  unshare: function *() {
    const body = this.request.body;
    body.u_id = 0;
    const res = yield handle.handleUnshare(this, body);
    //{done: true}
    handle.sendRes(this, res)
  },
  //下载分享
  downShare: function *() {
    //获取query
    const query = this.query;
    //查询文件信息
    const files = yield handle.handleDownshare(this, query);
    //创建临时目录
    const tmp = fs.mkdtempSync(path.join(__dirname, '../public/download/'));
    //改写文件目录
    handle.rewritePath(files);
    //复制文件到临时目录
    handle.copyFiles(files, tmp);
    //压缩
    const fileInfo = yield handle.zip(tmp);
    //发送zip
    handle.sendFile(this, fileInfo);
  },
  //转存
  saveShare: function *() {
    const body = this.request.body; //rows
    body.u_id = 0;
    body.time = new Date(Date.now() + (8 * 60 * 60 * 1000));
    //插入u_d表
    const res = yield handle.handleSaveShare(this, body);
    //{done: true}
    handle.sendRes(this, res);

  }
 }