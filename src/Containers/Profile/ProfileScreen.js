import React, { Component } from 'react'
import SignIn from '../../Components/Auth/SignIn'
import ProfileDetails from '../../Components/Profile/ProfileDetails'


// will render signin component if user is not logged in. Still make the route to '/signin' for signin page though

export default class ProfileScreen extends Component {


    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: true,
        };
    }


    render() {

        // const isLoggedIn = this.state.isLoggedIn;
        // const id = this.state.id
        return (
            <div className="mb10vh">
           
          
                <ProfileDetails />


            </div>
        )
    }
}
