import React, {Component} from "react";
import { gql, throwServerError, useQuery } from '@apollo/client';
import { graphql} from '@apollo/client/react/hoc';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { ListItemSecondaryAction } from "@mui/material";
import { compose } from 'redux'
import Form from "./form";


const TodosQuery = gql`
{
  todos {
    id 
    text
    complete
  } 
}
`;

const UpdateMutation = gql`
    mutation($id: ID!, $complete: Boolean!){
    updateTodo(id: $id,complete: $complete)

}
`;

const RemoveMutation = gql`
mutation($id: ID!){
  removeItem(id: $id)
}
`;

const createMutation = gql`
mutation($text: String!){
	createTodo(text: $text) {
	  id
    text
    complete
	}  
}
`;


class App extends Component {

  updateTodo = async todo =>  {
    //update todo 
    await this.props.updateTodo({
      variables:{
        id: todo.id,
        complete: !todo.complete
      },
      update: store => {
        const data = store.readQuery({query: TodosQuery});
        data.todos = data.todos.map(
          x => 
          x.id === todo.id 
          ? {
            ...todo, 
            complete: !todo.complete
          }
          : x 
        );
        store.writeQuery({query: TodosQuery, data});
      },
    });

  };

  removeTodo = async todo => {
    //remove todo 
    await this.props.removeTodo({
      variables:{
        id: todo.id,
      },
      update: store => {
        const data = store.readQuery({query: TodosQuery});
        data.todos = data.todos.filter(x => x.id !== todo.id);
        store.writeQuery({query: TodosQuery, data});
      },
    });
  };

  createTodo = async text => {
    //create todo 
    await this.props.createTodo({
      variables:{
        text
      },
      update: (store, {data: {createTodo}}) => {
        const data = store.readQuery({query: TodosQuery});
        data.todos.unshift(createTodo);
        store.writeQuery({query: TodosQuery, data});
      },
    });

  };

  render (){
    const {
      data: {loading, todos}
    } = this.props; 
    
    if (loading){
      return null; 
    }

    return (
      <div style={{display: "flex"}}>
        <div style={{margin: "auto", width: 400}}>
          <Paper elevation={1}>
          <Form submit={this.createTodo}  /> 
          <List>
            {todos.map((todo) => (
                <ListItem
                key={todo.id}
                role={undefined}
                dense 
                button 
                onClick={() => this.updateTodo(todo)}
            >
            <Checkbox
              checked={todo.complete}
              tabIndex={-1}
              disableRipple 
            />
            <ListItemText primary={todo.text}/>
            <ListItemSecondaryAction>
              <IconButton onClick={() => this.removeTodo(todo)}>
                <DeleteIcon/>
              </IconButton>
            </ListItemSecondaryAction>
            </ListItem>
            ))}
          </List>
          </Paper>
        </div>
      </div>

    );
  }

}

//{todos.map(todo => <div key={`${todo.id}-todo-item`}> {todo.text} </div>)}





export default compose(
  graphql(createMutation, {name: "createTodo"}),
  graphql(RemoveMutation, {name: "removeTodo"}), 
  graphql(UpdateMutation, { name: "updateTodo" }),
  graphql(TodosQuery)
  )(App);
