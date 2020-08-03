import React, { Component } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import axios from 'axios';
import {
  fetchChatroomList,
  fetchChatroom,
  setMessage,
  setRoomname,
  sendMessage,
  receiveMessage,
} from '../../../redux/actions/chatroom';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import { css } from 'glamor';
import ChatToolbar from '../../../Components/UI/Layout/ChatToolbar';
import { backToChatList } from '../../../redux/actions/chatroom';
import Input from '../../../Components/Chat/Input/Input';
import Messages from '../../../Components/Chat/Messages/Messages';
import AddChat from '../../../Components/UI/Layout/AddChat';
import { Button, ButtonGroup, ListGroup, ListGroupItem } from 'reactstrap';
import { ThemeContext } from '../../../Contexts/Theme';

require('dotenv').config();

class Chat extends Component {
  static contextType = ThemeContext;

  constructor(props) {
    super(props);
    this.socket = io('https://localhost:8000');
  }

  ROOT_CSS = css({
    height: '100%',
    width: '100%',
  });

  sendMessageToChatroom = (message, roomId, userId, username) => {
    console.log('[Chat.js]', message, roomId, userId);
    this.socket.emit('chat-message', { message, roomId, userId, username });
    this.props.sendMessage(message, roomId, userId, username);
  };

  async componentDidMount() {
    let chatroomList = await axios
      .get(`${process.env.REACT_APP_DEV_URL}chatroom/all/${this.props.userId}`)
      .then((response) => {
        console.log(response);
        return response.data.map((chatroom) => {
          return chatroom.chatroom_id;
        });
      });

    this.socket.on('chat-message', (data) => {
      console.log('[Chat.js]', data);
      this.props.sendMessage(data);
    });

    this.socket.on('join-chatroom', (message) => {
      console.log(message);
    });

    this.socket.on('test-message', (message) => {
      console.log(message);
    });

    this.socket.emit('test-message2', {
      message: 'I need to seek medical help',
      roomId: this.props.currentRoomId,
    });

    this.socket.emit('new-user', {
      name: this.props.username,
      roomList: chatroomList,
    });

    this.socket.on('user-connected', (name) => {
      console.log('Welcome to Mango Map, ' + name);
    });

    // Receive the messages from other users

    this.socket.on('test', (message) => {
      console.log(message);
    });

    this.socket.on('join-chatroom-user', (data) => {
      this.props.receiveMessage(
        data.username,
        `${data.username} has joined the chatroom!`
      );
    });

    this.props.fetchChatroomList(this.props.userId);
  }

  componentDidUpdate() {}

  componentWillUnmount() {
    this.socket.emit('disconnect');
    this.socket.off();
  }

  // Sending the message to server
  // Will trigger the chat-message event in componentDidMount
  sendMessageHandler = (event) => {
    event.preventDefault();
    console.log(this.state.messages);
    this.socket.emit(
      'send-chat-message',
      { message: this.state.messages },
      () => {
        console.log('sendMessageHandler callback is invoked');
        // Adding the new message just sent to the state
        this.setConversationHandler({
          userId: this.state.userId,
          user: this.state.username,
          message: this.state.messages,
        });

        // Clearing the input field
        this.setState({ ...this.state, messages: [''] });
      }
    );
  };

  render() {
    const { isLightTheme, light, dark } = this.context;
    const theme = isLightTheme ? light : dark;

    let displayedContent = this.props.currentRoomId ? (
      // This div is in a chatroom
      <div>
        <ChatToolbar
          backToChatList={this.props.backToChatList}
          currentRoomId={this.props.currentRoomId}
        />
        <h5 className='d-flex justify-content-center paddingy1'>
          {this.props.roomname}
        </h5>
        <ButtonGroup className='d-flex justify-content-center'>
          <Button
            style={{
              background: theme.low,
              color: theme.high,
              borderColor: theme.low,
            }}
          >
            Messages
          </Button>
          <Button
            style={{
              background: theme.low,
              color: theme.high,
              borderColor: theme.low,
            }}
          >
            TimeTree
          </Button>
        </ButtonGroup>
        <ScrollToBottom className={this.ROOT_CSS + ' textBox'}>
          <div className='margin5'>
            <Messages
              conversation={this.props.conversation}
              username={this.props.username}
            />
          </div>
        </ScrollToBottom>
        <div>
          <Input
            sendMessage={() =>
              this.sendMessageToChatroom(
                this.props.messages,
                this.props.currentRoomId,
                this.props.userId,
                this.props.username
              )
            }
            messages={this.props.messages}
            setMessage={this.props.setMessage}
          />{' '}
        </div>
      </div>
    ) : (
      // Display the list of chatrooms the user has
      this.props.roomList.map((room) => {
        return (
          <div
            className='chatroomListTesting paddingt1 margin5x'
            key={room.chatroom_id}
            onClick={() => {
              this.props.fetchChatroom(room.chatroom_id);
              this.props.setRoomname(room.room_name);
            }}
          >
            <ListGroup className=''>
              <ListGroupItem
                color={theme.listcolor}
                className='justify-content-between d-flex'
              >
                <img
                  className='material-icons roundimg'
                  src='https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRIMey7cyC1XcqtyFcJlNhz7yP4oT1kAahWPw&usqp=CAU'
                  alt='Avatar'
                />
                <h6 className='d-flex align-items-center'>{room.room_name}</h6>
                <h6 className='d-flex align-items-center blur light'>
                  {room.created_at.slice(0, 10)}
                </h6>
              </ListGroupItem>
            </ListGroup>
          </div>
        );
      })
    );

    return displayedContent;
  }
}

const mapStateToProps = (state) => {
  return {
    userId: state.chatroom.userId,
    username: state.chatroom.username,
    chatroomUserId: state.chatroom.chatroomUserId,
    roomList: state.chatroom.roomList,
    roomname: state.chatroom.roomname,
    currentRoomId: state.chatroom.currentRoomId,
    messages: state.chatroom.messages,
    conversation: state.chatroom.conversation,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchChatroomList: (userId) => dispatch(fetchChatroomList(userId)),
    fetchChatroom: (id) => dispatch(fetchChatroom(id)),
    setMessage: (event) => dispatch(setMessage(event)),
    setRoomname: (roomname) => dispatch(setRoomname(roomname)),
    sendMessage: (message, roomId, userId, username) =>
      dispatch(sendMessage(message, roomId, userId, username)),
    receiveMessage: (username, message) =>
      dispatch(receiveMessage(username, message)),
    backToChatList: () => dispatch(backToChatList()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
