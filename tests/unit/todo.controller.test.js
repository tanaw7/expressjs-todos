const TodoController = require("../../controllers/todo.controller");
const TodoModel = require("../../model/todo.model");
const httpMocks = require("node-mocks-http");
const newTodo = require("../mock-data/new-todo.json");
const allTodos = require("../mock-data/all-todos.json");

// mock implementations
TodoModel.create = jest.fn();
TodoModel.find = jest.fn();
TodoModel.findById = jest.fn();
TodoModel.findByIdAndUpdate = jest.fn();

let req, res, next;
const todoId = "66c2e2697fe9cf71dc811a2e";
beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = jest.fn();
});
describe("TodoController.updateTodo", () => {
  it("should have a updateTodo function", () => {
    expect(typeof TodoController.updateTodo).toBe("function");
  });
  it("should update with TodoModel.findByIdAndUPdate", async () => {
    req.params.todoId = todoId;
    req.body = newTodo;
    const properties = {
      new: true,
      useFindAndModify: false, // Mongoose thing.
    };
    req.params.properties = properties;
    await TodoController.updateTodo(req, res, next);
    expect(TodoModel.findByIdAndUpdate).toHaveBeenCalledWith(
      todoId,
      newTodo,
      properties
    );
  });
  it("should return a response with a json data with http code 200", async () => {
    req.params.todoId = todoId;
    req.body = newTodo;
    TodoModel.findByIdAndUpdate.mockReturnValue(newTodo);
    await TodoController.updateTodo(req, res, next);
    expect(res._isEndCalled()).toBeTruthy();
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toStrictEqual(newTodo);
  });
  it("should handle errors.", async () => {
    const errorMessage = { message: "Can't update the todo." };
    const rejectedPromise = Promise.reject(errorMessage);
    TodoModel.findByIdAndUpdate.mockReturnValue(rejectedPromise);
    await TodoController.updateTodo(req, res, next);
    expect(next).toHaveBeenCalledWith(errorMessage);
  });
  it("should handle 404 if data is not found", async () => {
    TodoModel.findByIdAndUpdate.mockReturnValue(null); // mock return value
    await TodoController.updateTodo(req, res, next); // make the call
    expect(res.statusCode).toBe(404); // see the results
    expect(res._isEndCalled()).toBeTruthy();
  });
});

describe("TodoController.getTodoById", () => {
  it("should have a getTodoById", () => {
    expect(typeof TodoController.getTodoById).toBe("function");
  });
  it("should call TodoModel.findById with route parameters", async () => {
    req.params.todoId = todoId;
    await TodoController.getTodoById(req, res, next);
    expect(TodoModel.findById).toBeCalledWith(todoId);
  });
  it("should return json body and response code 200", async () => {
    TodoModel.findById.mockReturnValue(newTodo);
    await TodoController.getTodoById(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res._isEndCalled()).toBeTruthy();
    expect(res._getJSONData()).toStrictEqual(newTodo);
  });
  it("should handle errors", async () => {
    const errorMessage = { message: "ID not found" };
    const rejectedPromise = Promise.reject(errorMessage);
    TodoModel.findById.mockReturnValue(rejectedPromise);
    await TodoController.getTodoById(req, res, next);
    expect(next).toHaveBeenCalledWith(errorMessage);
  });
  it("should return 404 when item doesn't exist", async () => {
    TodoModel.findById.mockReturnValue(null);
    await TodoController.getTodoById(req, res, next);
    expect(res.statusCode).toBe(404);
    expect(res._isEndCalled()).toBeTruthy();
  });
});

describe("TodoController.getTodos", () => {
  it("should have a getTodos function", () => {
    expect(typeof TodoController.getTodos).toBe("function");
  });
  it("should call TodoModel.find({})", async () => {
    await TodoController.getTodos(req, res, next);
    expect(TodoModel.find).toHaveBeenCalledWith({});
  });
  it("should return res 200 and all the todo documents", async () => {
    TodoModel.find.mockReturnValue(allTodos);
    await TodoController.getTodos(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res._isEndCalled()).toBeTruthy();
    expect(res._getJSONData()).toStrictEqual(allTodos);
  });
  it("should handle errors and call 'next with an error message if we get an exception", async () => {
    const errorMessage = { message: "Respond doesn't return any document." };
    const rejectedPromise = Promise.reject(errorMessage);
    TodoModel.find.mockReturnValue(rejectedPromise);
    await TodoController.getTodos(req, res, next);
    expect(next).toHaveBeenCalledWith(errorMessage);
  });
});

describe("TodoController.createTodo", () => {
  beforeEach(() => {
    req.body = newTodo;
  });

  it("should have a createTodo function.", () => {
    expect(typeof TodoController.createTodo).toBe("function");
  });
  it("should call TodoModel.create", () => {
    TodoController.createTodo(req, res, next);
    expect(TodoModel.create).toHaveBeenCalledWith(newTodo);
  });
  it("should return 201 response code.", async () => {
    await TodoController.createTodo(req, res, next);
    expect(res.statusCode).toBe(201);
    expect(res._isEndCalled()).toBeTruthy(); // making sure the response is actually sent when our client is going to the end point.
  });
  it("should return a json body in the response.", async () => {
    TodoModel.create.mockReturnValue(newTodo); // just mocking that it returns newTodo.
    await TodoController.createTodo(req, res, next);
    expect(res._getJSONData()).toStrictEqual(newTodo); // syntax from node-moacks-http package documentation.
  });

  it("should handle errors", async () => {
    const errorMessage = { message: "Done property missing." };
    const rejectedPromise = Promise.reject(errorMessage);
    TodoModel.create.mockReturnValue(rejectedPromise);
    await TodoController.createTodo(req, res, next);
    expect(next).toHaveBeenCalledWith(errorMessage);
  });
});
