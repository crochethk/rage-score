# Routing

The routing is realized client-side using `react-router` in its _library mode_ (aka. _declarative_).

## Routes

The application defines the following route structure:

### `/`

Main page featuring the ready to use score table.

### `/spectate/:roomId`

Spectator mode page, featuring the score table in a _readonly_ mode.

#### Parameters

- `roomId` - The identifier necessary to join a game room for spectating.

<!--
#### Query Parameters

_None._
 -->

#### Errors

- `404`
    - Missing or invalid `roomId`

## Route Configuration

Routes are configured in the app's main entry point `src/main.tsx` using [React Router's declarative API](https://reactrouter.com/start/declarative/routing) .

<!-- ## Navigation

Navigation between routes is handled using React Router's navigation hooks and components. -->
