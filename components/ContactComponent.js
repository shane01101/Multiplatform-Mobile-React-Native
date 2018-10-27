import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Card } from 'react-native-elements';

class Contact extends Component {

    static navigationOptions = {
        title: 'Contact Us'
    };

    render() {
        return(
            <Card title="Contact Information" >
                <Text style={{margin: 10}}>
                    121, Clear Water Bay Road{"\n\n"}
                    Clear Water Bay, Kowloon{"\n\n"}
                    HONG KONG{"\n\n"}
                    Tel: +852 1234 5678{"\n\n"}
                    Fax: +852 8765 4321{"\n\n"}
                    Email:confusion@food.net{"\n\n"}
                </Text>
            </Card>
        );
    }
}

export default Contact;