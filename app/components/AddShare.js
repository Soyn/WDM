import React, { Component } from 'react'

export default class AddShare extends Component {
  render() {
    const { addShareHandler, addShareLink, resetHandler } = this.props;
    return (
      <div id="addshare-div">
        <button type="button" className="btn btn-default btn-sm tool" data-toggle="modal" data-target="#addshare">
          <img src="/css/svg/share_green.svg" className="funcbarsvg" />Share
        </button>
        <div id="addshare" className="modal fade" ref="modal" role="add share">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" onClick={() => resetHandler()}>&times;</button>
                <h4 className="modal-title">Create Share Link</h4>
              </div>
              {addShareLink.link ?
                <div className="modal-body">
                  <div><span>{`the link is http://localhost:3000/share?addr=${addShareLink.link}`}</span></div>
                  <div><span>{addShareLink.secret && `the secret is ${addShareLink.secret}`}</span></div>
                </div> :
                <div className="modal-body">
                  <div>
                    <button className="btn btn-primary btn-sm" onClick={() => addShareHandler(false)}><span>Public Link</span></button>
                    <span> Anyone who knows the link can access</span>
                  </div>
                  <div>
                    <button className="btn btn-primary btn-sm" onClick={() => addShareHandler(true)}><span>Secret Url</span></button>
                    <span>Only shared friends can access</span>
                  </div>
                </div>}
              <div className="modal-footer">
                <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => resetHandler()}>Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}