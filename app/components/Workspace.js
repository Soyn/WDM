import React, { Component, PropTypes } from 'react';
import Row from './Row';
import Displaybar from './Displaybar';
import { connect } from 'react-redux'
import { fetchCurrentFiles } from '../actions'
import merge from 'deepmerge'

class Workspace extends Component {
  componentWillMount() {
    this.props.loadFilesHandler();
  }
  getIconName(file) {
    if (file.isdir)
      return 'folder_24pix.svg';
    let extname = file.name.match(/\.(doc|docx|pdf|xls|gif|jpg|jpeg|png|mp4|avi|rmvb|wmv|mov|flv|webm)$/i);
    if (extname)
      extname = extname[0];
    switch (extname) {
      case '.doc':
      case '.docx':
        return 'doc.svg';
      case '.pdf':
        return 'pdf.svg';
      case '.xls':
        return 'xls.svg'
      case '.gif':
      case '.jpg':
      case '.jpeg':
      case '.png':
        return 'image.svg';
      case '.mp4':
      case '.avi':
      case '.rmvb':
      case '.wmv':
      case '.mov':
      case '.flv':
      case 'webm':
        return 'video.svg';
      default:
        return 'default';
    }
  }

  formatBytes(bytes,decimals = 3) {
    if(!bytes)
      return bytes;
    if(bytes == 0) return '0 Bytes';
    var k = 1000,
    dm = decimals,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
  render() {

    const { currentFiles, currentPath, map, loadFilesHandler } = this.props;

    return (
      <div className="table-responsive workspace">
        <Displaybar currentPath={currentPath} map={map} clickHandler={loadFilesHandler} />
        <table className="table table-striped table-bordered table-hover" >
          <thead>
            <tr>
              <th >
                <input type='checkbox' />
              </th>
              <th >Name</th>
              <th >Size</th>
              <th >LastModified</th>
              <th>CreateTime</th>
            </tr>
          </thead>
          <tbody>
            {currentFiles.map(file => {
              return (
                <Row key={file.key} {...file} size={this.formatBytes(file.size, 0)} icon={this.getIconName(file)} path={file.path + file.key + '/'} clickHandler={loadFilesHandler} />
              )
            })}
          </tbody>
        </table>
      </div>
    );
  }
}


Workspace.propTypes = {
  currentFiles: PropTypes.array.isRequired,
  currentPath: PropTypes.string.isRequired,
  loadFilesHandler: PropTypes.func.isRequired,
  map: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  currentFiles: merge({}, state.workspace.currentFiles, {clone: true}),
  currentPath: state.workspace.currentPath,
  map: merge({}, state.tree.map, {clone: true})
})

const mapDispatchToProps = dispatch => ({
  loadFilesHandler: path => dispatch(fetchCurrentFiles(path))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Workspace);