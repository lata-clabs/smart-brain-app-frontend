import React,{Component} from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import './App.css';

  const initialState = {
    input: '',
    imageUrl: '',
    box:{},
    route : 'signin',
    isSignedIn:false,
    user : {
      id:'',
      name: '',
      email: '',
      entries: 0,
      joined: '',
    }
  };

class App extends Component{
  
  constructor(){
    super();
    this.state = initialState;
  }

  calculateFaceLocation = (data)=>{
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return{
      leftCol: data.left_col * width,
      rightCol:width - (data.right_col *width),
      topRow: data.top_row * height,
      bottomRow:height - (data.bottom_row * height),
    }
  }

  displayBox= (box)=>{
    console.log(box);
    this.setState({box:box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
    //console.log(event.target.value);
  }

  onSubmit=()=>{
    this.setState({imageUrl: this.state.input});
    fetch('http://localhost:3000/imageurl', {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body : JSON.stringify({
        input: this.state.input,
      }),
    })
    .then(response => {
      response.json();
    })
    .then(response => {
      if(response){
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type':'application/json'},
          body : JSON.stringify(
            {
              id: this.state.user.id,
            }
          ),
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user,{entries: count}))
        })
      }
      this.displayBox(this.calculateFaceLocation(response.outputs[0].data.regions[0].region_info.bounding_box))
    })
    .catch(err => console.log('Error:',err));
  }

  onRouteChange = (route) =>{
    if(route==='signout'){
      this.setState({initialState})
    }else if (route==='home'){
      this.setState({isSignedIn:true})
    }
    this.setState({route:route});
  }

  loadUser = (data) =>{
    this.setState({
      user: {
        id:data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      }
    });
  }

  render(){
    const { imageUrl, box, route, isSignedIn} =this.state;
    return(
      <div className="App">
        <Navigation 
          isSignedIn= {isSignedIn} 
          onRouteChange= {this.onRouteChange}
        />
        <Logo/>
        { route ==='home'
          ?
          <div>
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm 
              onSubmit ={this.onSubmit} 
              onInputChange={ this.onInputChange}
            />
            <FaceRecognition imageUrl={imageUrl} box ={box}/>
          </div>
          : (
            (route ==='signin' || route ==='signout')
            ?
            <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            :
            <Register loadUser = {this.loadUser} onRouteChange= {this.onRouteChange}/>
          )
        }
      </div>
    );
  } 
}

export default App;