import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Link } from 'react-router-dom';
import { createStructuredSelector } from 'reselect';
import {
  Table, Header, Container, Loader, Button, Radio,
  Tab, Modal, Grid, TextArea, Label, Input, Dimmer, Dropdown,
} from 'semantic-ui-react';

import ContentEditable from 'react-contenteditable'
import { messageSaveRequest, loadNewMessage, msgLoadRequest } from '../redux/actions';
import { makeSelectMsg, makeSelectMsgLoading } from '../redux/selectors';
class EditmessageModal extends Component {
  constructor(...args) {
    super(...args);

    const { open, msgId, tags, msgTemplate, categories } = this.props;

    let categoryList = [];
    categories.map((category) => {
      categoryList.push({
        key: category.get('tag'),
        value: category.get('id'),
        text: category.get('name'),
      });
    });

    this.state = {
      showModal: open,
      msgId: msgId,
      tags: tags,
      placeHolder: 'Edit message template here ...',
      triggerName: '',
      messageSchedule: '',
      msgTemplate: msgTemplate,
      categoryList: categoryList,
      category: '',
      triggerNameError: false,
      scheduleError: false,
      categoryError: false,
    };
  }

  componentWillMount() {
    this.loadMessage(this.state.msgId);
  }

  loadMessage = (id) => {
    if (id === 'new') {
      this.props.loadNewMessage();
    } else {
      this.setState({msgId: id});
      this.props.msgLoadRequest(id);
    }
  }

  onInputField = (field) => (evt) => {
    if (field === 'triggerName') {
      this.setState({triggerName: evt.target.value});
    } else if (field === 'messageSchedule') {
      this.setState({messageSchedule: evt.target.value});
    }
  }

  dragStart = (event) => {
    let tagName = '<b class="dotted">' + event.target.innerHTML +'</b>';
    event.dataTransfer.setData('text/html', tagName);
  }

  onSave = () => {
    const { msgId, triggerName, messageSchedule, msgTemplate, category } = this.state;
    if (!triggerName) {
      this.setState({ triggerNameError: true });
    }
    if (!messageSchedule) {
      this.setState({ scheduleError: true });
    }
    if (!category) {
      this.setState({ categoryError: true });
    }
    if (triggerName && messageSchedule && category) {
      this.props.messageSaveRequest( msgId, triggerName, messageSchedule, msgTemplate, category );
      this.props.onClose();
    }
  }

  onSelectCategory = (field) => (event, data) => {
    if (field == 'category') {
      this.setState({ category: data.value });
    }
  }

  onEditMessageTemplate = (event) => {
    this.setState({msgTemplate: event.target.value});
  }

  dragDropTagsButton = (tagLists) => {
    return tagLists.map((tag) => (
      <Button key={tag.get('id')} draggable='true' basic color='black' className="tag-button" onDragStart={this.dragStart} >
        {tag.get('tag_name')}
      </Button>
    ));
  }
  render() {
    const { showModal, msgId, tags, categoryList } = this.state;
    const { msg, loading } = this.props;
    return (
      <Modal size="small" open={showModal} onClose={this.props.onClose}  className="msg-trigger-modal" closeIcon>
        <Dimmer active={loading}>
          <Loader />
        </Dimmer>
        <Modal.Header>
          { msg.get('id') ? `Edit ${msg.get('trigger_name')} trigger` : 'Create new custom trigger'}
          { msg.get('id') &&
            <p className="sub-message-header">{`${msg.get('trigger_name')} trigger ${msg.get('message_schedule')}`}</p>
          }
        </Modal.Header>
        <Modal.Content className="msg-modal-content">
          {msgId=='new' &&
            <Grid>
              <Input
                className="trigger-name"
                label='Trigger Name'
                required
                error={this.state.triggerNameError}
                placeholder='Input trigger name...'
                value={msg.get('trigger_name') || this.state.triggerName}
                onChange={this.onInputField('triggerName')}
              />
              <Input
                className="message-schedule"
                label='Message schedule'
                required
                error={this.state.scheduleError}
                placeholder='Input message schedule...'
                value={msg.get('message_schedule') || this.state.messageSchedule}
                onChange={this.onInputField('messageSchedule')}
              />
            </Grid>
          }
          <Grid>
            <Grid.Row className="message-box-container">
              <Grid.Column width={16} className="message-div-first">
                <Header as='h3' className="message-header-content-first">
                  Your message to customer
                </Header>
                <Header as='h4' className="message-header-content-second">
                  Preview and customize the triggered message below
                </Header>
              </Grid.Column>
              <Grid.Column width={16} className="message-div-second">
                <ContentEditable
                  className="messages"
                  placeholder={this.state.placeHolder}
                  html={msg.get('message_content') || ''}
                  disabled={false}
                  onChange={this.onEditMessageTemplate}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Header as='h6'>ADD MORE TAGS(DRAG AND DROP TO YOUR MESSAGE)</Header>
          { showModal &&
            this.dragDropTagsButton(tags)
          }
          <Dropdown placeholder="select one of categories..." fluid selection options={categoryList} onChange={this.onSelectCategory('category')} error={this.state.categoryError} ></Dropdown>
        </Modal.Content>
        <Modal.Actions>
          <Button basic color='black' onClick={this.props.onClose} > Cancel </Button>
          <Button color='facebook' icon='checkmark' labelPosition='right' onClick={this.onSave} content='Save' />
        </Modal.Actions>
      </Modal>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  msg: makeSelectMsg(),
  loading: makeSelectMsgLoading(),
});

const mapDispatchToProps = {
  messageSaveRequest,
  loadNewMessage,
  msgLoadRequest,
};

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect)(EditmessageModal)
