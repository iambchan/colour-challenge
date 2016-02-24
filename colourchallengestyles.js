import { StyleSheet } from 'react-native';

export const questionStyles = StyleSheet.create({
	blue: { backgroundColor: '#89cff0' },
  	red: { backgroundColor: '#FF0000' },
  	green: { backgroundColor: '#00FF00' },
  	yellow: { backgroundColor: '#FFFF00' },
});

export const styles = StyleSheet.create({

  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
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
