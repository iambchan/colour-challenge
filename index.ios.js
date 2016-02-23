/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  ListView,
  View,
  TouchableHighlight
} from 'react-native';

var TimerMixin = require('react-timer-mixin');
import Store from 'react-native-store';

const DB = {
    'Scores': Store.model('Scores')
}

var colors = ['red', 'blue', 'green', 'yellow'];
var numQuestions=10;


var shuffle = (arr) =>{
    return arr.slice(0).map(function(x) { 
        return [x, Math.random()];
    })
    .sort(function(a,b) { 
        return a[1] > b[1];
    })
    .map(function(x) { return x[0]; });
}

// Returns random colours
var getRandomColourText = function() {
  var [fill, text] = shuffle(colors);
  //pick the first two colours of the randomized array
  return { fill: fill, text: text};
}


var renderColor = function(colorString){
  return <Choice color={colorString.rowData} />
}

var Choice = React.createClass({
    render: function() {
        return <TouchableHighlight onPress={ this.props.onClick }>
                  <Text style={[questionStyles[this.props.color], styles.colorChoice]}>
                  </Text>
                </TouchableHighlight>
    }
})


// Text color can be different from the color the text is describing. 
// The answer is correct if user selects the color the text is describing
var ColourWord = React.createClass({
    render: function() {
        return <Text style={[styles[this.props.color], styles.ColorWord]}>
                  {this.props.text}
               </Text>;
    }
});

var Score = React.createClass({
  render: function() {
    return <Text>{this.props.correct}/{numQuestions}</Text>
  }
});

// Takes in a list of scores
var ScoreBoard = React.createClass({
  getInitialState: function() {
    return {
      scoreSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      scoreSource: this.state.scoreSource.cloneWithRows(nextProps.scores)
    });
  },

  render: function() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Leaderboard</Text>
        <ListView
          dataSource={this.state.scoreSource}
          renderRow={(rowData) => <Text style={styles.green}>score: {rowData.score} time: {rowData.time} date: {rowData.date}</Text>} />
      </View>
      );
  }
});


var Game = React.createClass({
  mixins: [TimerMixin],
  
  startTimer() {
    this.timer = this.setInterval(() => {
       this.setState({
         time: this.state.time + 1
       });
    }, 1000);
  },

  getScores: function() {
    DB.Scores.find().then((resp) => {
    console.log("GOT SCORES", resp);
    this.setState({items: resp});
    });
  },

  addScore: function(newScore) {
    return DB.Scores.add(newScore);
  },

  clearScoreBoard: function() {
    DB.Scores.destroy();
    this.setState({items: []});
  },
  
  componentDidMount() {
    this.startTimer(); 
    this.getScores();
  },

  componentWillUnmount() {
    this.clearInterval(this.timer);
  },

  resetScore: function() {
     this.setState({
      correct: 0,
      color: getRandomColourText(),
      dataSource: this.ds.cloneWithRows(shuffle(colors)),
      totalQuestionsComplete: 0,
      status: '',
      numQuestionsAnswered: 0,
      time: 0,
      gameFinished: false
     });
     if(this.timer == null) { this.startTimer(); }
  },

  updateGameState: function(rightAnswer, gameFinished) {
        this.setState({
          correct: rightAnswer ? this.state.correct + 1 : this.state.correct,
          color: getRandomColourText(),
          dataSource: this.ds.cloneWithRows(shuffle(colors)),
          totalQuestionsComplete: this.state.totalQuestionsComplete + 1,
          status: rightAnswer ? 'Correct!' : 'Wrong!',
          numQuestionsAnswered: this.state.numQuestionsAnswered + 1,
          gameFinished: gameFinished
        });
  },

  updateScore: function(selectedColour) {
    if(this.state.gameFinished) {
      return;
    }

    var rightAnswer = selectedColour === this.state.color.text;
    var allQuestionsAnswered = this.state.numQuestionsAnswered + 1 === 10;
    this.updateGameState(rightAnswer, allQuestionsAnswered);
    if(allQuestionsAnswered) { 
      this.addScore({score: this.state.correct, time: this.state.time, date: new Date()})
        .then(() => this.getScores());

      this.clearInterval(this.timer); 
      this.timer = null;
     }
  },

  render: function(){

      if(this.state.gameFinished) {
        // Save score
        var msg = (this.state.correct < 6) ? ':( Nice, but you should try a little harder..' : 'Wow! You must be great at shooting games!' 
        
        return (
          <View style={styles.container}>
            <Text>Finished!</Text>
            <Text>{msg}</Text>
            <Text>Your score is </Text>
            <Score correct={this.state.correct} numQuestions={numQuestions} />
            <Text>Time to finish: {this.state.time} seconds</Text>
            <Text style={styles.button} onPress={() => this.resetScore()}>Play again!</Text>
            <Text style={styles.button} onPress={() => this.clearScoreBoard()}>Clear Scoreboard</Text>
            
            <ScoreBoard scores={this.state.items} />
            <Text>{JSON.stringify(this.state)}</Text>
          </View>);
      }
      else{
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Colour Challenge</Text> 
          <Text style={styles.instructions}>Choose the colour the text is describing as fast as you can!</Text>
          <ColourWord color={this.state.color.fill} text={this.state.color.text} />
          <Text>{this.state.time}</Text>
          <Text>{this.state.status}</Text>

            <ListView
              dataSource={this.state.dataSource}
              renderRow={
                (rowData) => 
                <Choice onClick={() => this.updateScore(rowData) } color={rowData} />
              }
              style={styles.listView}/> 

          <Text>Score: </Text>
          <Score correct={this.state.correct} numQuestions={numQuestions} />
        </View>
      );
    }
  },

  // Invoked once before the component is mounted. The return value will be used as the initial value of this.state.
  getInitialState: function() {
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    return {
      dataSource: this.ds.cloneWithRows(shuffle(colors)),
      answers: 0,
      correct: 0,
      color: getRandomColourText(), 
      totalQuestionsComplete: 0, 
      status: '',
      numQuestionsAnswered: 0,
      time: 0,
      items: "",
      gameFinished: false
    };
  }
});




class ColourChallenge extends Component {
  render() {
    return (
      <Game numQuestions={10}/>
    );
  }
}




var questionStyles = StyleSheet.create({
  blue: {
    backgroundColor: '#89cff0'
  },
  red: {
    backgroundColor: '#FF0000'
  },
  green: {
    backgroundColor: '#00FF00'
  },
  yellow: {
    backgroundColor: '#FFFF00'
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
   listView: {
    padding: 20,
    backgroundColor: '#aaaaaa'
  },
  title: {
    padding: 20,
    fontSize: 30,
    textAlign: 'center'
  },
  instructions: {
    fontSize:12,
    textAlign: 'center'
  },
  blue: {
    color: '#89cff0'
  },
  red: {
    color: '#FF0000'
  },
  green: {
    color: '#00FF00'
  },
  yellow: {
    color: '#FFFF00'
  },
  ColorWord: {
    textAlign: 'center',
    fontSize: 50
  },
  colorChoice: {
    paddingRight: 200,
    paddingBottom: 50,
    fontSize: 50,
    textAlign: 'center'
  },
  score: {
    flex: 1,
  },
  button: {
    backgroundColor: '#66ccff',
    borderColor: '#3399ff',
    borderWidth: 1,
    borderRadius: 3,
    padding: 7
  }
});


AppRegistry.registerComponent('ColourChallenge', () => ColourChallenge);
