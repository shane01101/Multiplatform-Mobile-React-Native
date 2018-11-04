import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button, Alert, PanResponder } from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment))
});

function RenderDish(props) {
    const dish = props.dish;

    handleViewRef = ref => this.view = ref;

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -200 )
            return true;
        else
            return false;
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {
            this.view.rubberBand(1000)
                .then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));
        },
        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState))
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                        {
                            text: 'Cancel', 
                            onPress: () => console.log('Cancel Pressed'), 
                            style: 'cancel'
                        },
                        {
                            text: 'OK', 
                            onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}
                        },
                    ],
                    { cancelable: false }
                );

            return true;
        }
    })
    
    if (dish != null) {
        return(
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
                ref={this.handleViewRef}
                {...panResponder.panHandlers}>
                <Card
                    featuredTitle={dish.name}
                    image={{uri: baseUrl + dish.image}}>
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                    <View style={styles.cardRow}>
                        <Icon
                            raised
                            reverse
                            name={ props.favorite ? 'heart' : 'heart-o' }
                            type='font-awesome'
                            color='#f50'
                            style={styles.iconItem}
                            onPress={() => props.favorite ? console.log('Already favoriote') : props.onPress()}
                        />
                        <Icon
                            raised
                            reverse
                            name={ 'pencil' } 
                            type='font-awesome'
                            color='#512DA8'
                            style={styles.iconItem}
                            onPress={() => props.onToggleModal()}
                        />
                    </View> 
                </Card>
            </Animatable.View>
        );
    }
    else {
        return(<View></View>);
    }
}

function RenderComments(props) {

    const comments = props.comments;
            
    const renderCommentItem = ({item, index}) => {
        
        return (
            <View key={index} style={{flex: 1, alignItems: 'flex-start', margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Rating 
                    style={{paddingVertical:10}}
                    imageSize={15}
                    readonly
                    startingValue={parseInt(item.rating)}
                />
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };
    
    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title='Comments' >
            <FlatList 
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}


class Dishdetail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            author: '',
            rating: 5,
            comment: '', 
            dishId: this.props.navigation.getParam('dishId', '')
        };
    }

    toggleModal() { 
        this.setState({showModal: !this.state.showModal});
    }

    resetForm() {
        this.setState({
            showModal: false,
            author: '',
            rating: 5,
            comment: '',
            dishId: this.props.navigation.getParam('dishId', '')
        });
    }

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    handleComment() {
        this.toggleModal();
        this.props.postComment(this.state.dishId, this.state.rating, this.state.author, this.state.comment);
        this.resetForm();
    }

    render() {
        const dishId = this.props.navigation.getParam('dishId', '');

        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)} 
                    onToggleModal={() => this.toggleModal()}
                />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />

                <Modal
                animationType = {"slide"} 
                transparent = {false}
                visible = {this.state.showModal}
                onDismiss = {() => this.toggleModal() }
                onRequestClose = {() => this.toggleModal() }>
                <View style={styles.modal}>
                    <View>
                        <Rating
                            showRating
                            type="star"
                            startingValue={5}
                            imageSize={40}
                            onFinishRating={(value) => this.setState({rating: value})}
                            style={{ paddingVertical: 10 }}
                        />
                    </View>
                    <View>
                        <Input
                            placeholder='Author'
                            leftIcon={{ type: 'font-awesome', name: 'user-o' }}
                            onChangeText={(value) => this.setState({author: value})}
                        />
                    </View>
                    <View>
                        <Input
                            placeholder='Comment'
                            leftIcon={{ type: 'font-awesome', name: 'comment-o' }}
                            onChangeText={(value) => this.setState({comment: value})}
                        />
                    </View>
                    <View style={{margin: 10, paddingVertical: 5}}>
                        <Button style = {styles.container}
                            onPress={() => this.handleComment()}
                            title="Submit"
                            color="#512DA8"
                            accessibilityLabel="Learn more about this purple button"
                        />
                    </View>
                    <View style={{margin: 10}}>
                        <Button
                            onPress={() => this.resetForm()}
                            title="Cancel"
                            color="#888888"
                            accessibilityLabel="Learn more about this purple button"
                        />
                    </View>
                </View>
            </Modal>
            </ScrollView>
            
        );
    }
}

const styles = StyleSheet.create({
    IconItem: {
        flex: 1 
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 50,
        paddingVertical: 50
    },
    button: {
        backgroundColor: 'green',
        width: '40%',
        height: 40
    }

    // drawerHeader: {
    //   backgroundColor: '#512DA8',
    //   height: 140,
    //   alignItems: 'center',
    //   justifyContent: 'center',
    //   flex: 1,
    //   flexDirection: 'row'
    // },
    // drawerHeaderText: {
    //   color: 'white',
    //   fontSize: 24,
    //   fontWeight: 'bold'
    // },
    // drawerImage: {
    //   margin: 10,
    //   width: 80,
    //   height: 60
    // }
  });

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);