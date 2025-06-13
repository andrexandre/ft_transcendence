# ft_transcendence

Full-stack web application centered around a Pong game competition

## Usage

1. Clone the repository
```sh
git clone https://github.com/andrexandre/ft_transcendence.git ; cd ft_transcendence
```

2. Create the .env file and add your google credentials
```sh
make env
```
```sh
GOOGLE_ID = 000-xxx.apps.googleusercontent.com
GOOGLE_SECRET = XXX-xxx
```

3. Run the containers
```sh
make
```

4. Open the app in a browser
```sh
make open
```

5. Add certificate exceptions in the browser. The following steps are how to add them in firefox
- Go to `Settings` -> `Privacy & Security` or run the following command:
```sh
firefox about:preferences#privacy
```
- In the title `Security` -> `Certificates` -> `View Certificates` -> `Servers`
- `Add Exception...` for each port by changing the `Location:`
  - `https://<IP>:5500`
  - `https://<IP>:5000`
  - `https://<IP>:2000`
  - `https://<IP>:8080`
  - and clicking `Get Certificate` and `Confirm Security Exception` each time
- Return to the opened tab, refresh the page and everything should be set up

Clean up all docker resources
```sh
make system-prune
```

### Game Controls

- `Up` and `Down`: To move the paddle

> [!NOTE]
> This project is part of the 42 School curriculum
