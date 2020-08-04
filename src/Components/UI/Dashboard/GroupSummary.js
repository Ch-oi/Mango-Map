import React from 'react'
import { ThemeContext } from '../../../Contexts/Theme'
import { ListGroup, ListGroupItem } from 'reactstrap';

const GroupSummary = (props) => {
  console.log(props)
  return (

    <ThemeContext.Consumer>{(context) => {
      const { isLightTheme, light, dark } = context;
      const theme = isLightTheme ? light : dark;

      const handleClick =(e)=>{
        return props.history.push('/chat')
      }

      return (
        <div className="margin5">
        <ListGroup >
        <ListGroupItem onClick={handleClick} color={theme.listcolor} tag="a"  className="justify-content-between d-flex">
        <img className="material-icons roundimg"
        src='https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRIMey7cyC1XcqtyFcJlNhz7yP4oT1kAahWPw&usqp=CAU'
        alt='Avatar'/>
        <h4 className="d-flex align-items-center">{props.chatroom.room_name}</h4>
        <h6 className="d-flex align-items-center blur">{props.chatroom.created_at.slice(0, 10)}
        </h6>
    
        </ListGroupItem>

       
        </ListGroup>

           

        </div>) }}
        </ThemeContext.Consumer>
    )
}

export default GroupSummary
