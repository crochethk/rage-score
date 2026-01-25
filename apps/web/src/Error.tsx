export function Error({ children }: { children: React.ReactNode }) {
  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-dark bg-opacity-75 text-white">
      <h1 className="display-1">{children}</h1>
    </div>
  );
}

export function Error404() {
  return <Error>404 Not Found</Error>;
}
