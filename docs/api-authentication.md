# API Authentication

The API uses JSON Web Tokens (JWT) for protected routes such as `/users`.

## Login

Obtain a token with the seeded admin credentials:

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/flashcards/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')
```

## Use the token

Include the token in the `Authorization` header for subsequent requests:

```bash
curl -X GET http://localhost:5000/flashcards/api/users \
  -H "accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

Tokens are valid for 60 minutes by default. You can export the variable to reuse it:

```bash
export FLASHCARDS_JWT=$TOKEN
```

To persist the token across shell sessions, save it and reload when needed:

```bash
echo $TOKEN > ~/.flashcards-jwt
export FLASHCARDS_JWT=$(cat ~/.flashcards-jwt)
curl -X GET http://localhost:5000/flashcards/api/users \
  -H "accept: application/json" \
  -H "Authorization: Bearer $FLASHCARDS_JWT"
```

## Add a User

Only admins can create new users. Send a `POST` request with `username`,
`password` and optional `roles` fields:

```bash
curl -X POST http://localhost:5000/flashcards/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FLASHCARDS_JWT" \
  -d '{"username":"bob","password":"secret","roles":["user"]}'
```

The API hashes the password and generates an ID automatically.
