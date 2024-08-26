const request = require("supertest");
const app = require("../../app");
const newTodo = require("../mock-data/new-todo.json");

const endpointUrl = "/todos/";

let firstTodo, newTodoId;
const nonExistingTodoId = "66c2e2697fe9cf71dc8100bb";

describe(endpointUrl, () => {
  test("GET " + endpointUrl, async () => {
    const response = await request(app).get(endpointUrl);
    expect(response.statusCode).toBe(200);
    expect(response.body).not.toBeNull();
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body[0].title).toBeDefined();
    expect(response.body[0].done).toBeDefined();
    expect(typeof response.body[0].title).toBe("string");
    expect(typeof response.body[0].done).toBe("boolean");
    firstTodo = response.body[0];
  });
  test("GET by Id: " + endpointUrl + ":todoId", async () => {
    const response = await request(app).get(endpointUrl + firstTodo._id);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(firstTodo.title);
    expect(response.body.done).toBe(firstTodo.done);
  });
  test("Get todoBy id doesn't exist" + endpointUrl + ":todoId", async () => {
    const response = await request(app).get(
      endpointUrl + "66c2e2697fe9cf71dc810011"
    );
    expect(response.statusCode).toBe(404);
  });

  it(
    "POST " + endpointUrl,
    async () => {
      const response = await request(app).post(endpointUrl).send(newTodo);
      expect(response.statusCode).toBe(201);
      expect(response.body.title).toBe(newTodo.title);
      expect(response.body.done).toBe(newTodo.done);
      newTodoId = response.body._id;
    },
    15000
  );
  it(
    "should return err 500 on malformed data with POST: " + endpointUrl,
    async () => {
      const response = await request(app)
        .post(endpointUrl)
        .send({ title: "Missing Done property" });
      expect(response.statusCode).toBe(500);
      expect(response.body).toStrictEqual({
        message: "Todo validation failed: done: Path `done` is required.",
      });
    }
  );
  it("PUT " + endpointUrl, async () => {
    const testData = {
      title: "Make Integration test for PUT",
      done: true,
    };
    const resp = await request(app)
      .put(endpointUrl + newTodoId)
      .send(testData);

    expect(resp.statusCode).toBe(200);
    expect(resp.body.title).toBe(testData.title);
    expect(resp.body.done).toBe(testData.done);
  });

  it("should return 404 on PUT " + endpointUrl, async () => {
    const testData = { title: "Make integration test for PUT", done: true };
    const res = await request(app)
      .put(endpointUrl + nonExistingTodoId)
      .send(testData);
    expect(res.statusCode).toBe(404);
  });

  test("DELETE " + endpointUrl + ":todoId", async () => {
    const response = await request(app).delete(endpointUrl + newTodoId);
    expect(response.statusCode).toBe(200);
  });

  it("should return 404 on Delete " + endpointUrl, async () => {
    const response = await request(app).delete(endpointUrl + nonExistingTodoId);
    expect(response.statusCode).toBe(404);
  });
});
