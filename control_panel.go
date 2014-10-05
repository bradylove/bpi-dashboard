package main

import (
    "fmt"
    "github.com/go-martini/martini"
    "github.com/martini-contrib/render"
    turnpike "gopkg.in/jcelliott/turnpike.v1"
    // "math/rand"
    "net/http"
    "time"
)

func main() {
    go StartWebServer()

    StartWebSocketServer()
}

func StartWebServer() {
    m := martini.Classic()

    m.Use(render.Renderer())

    m.Get("/", func(r render.Render) {
        r.HTML(200, "index", "")
    })

    m.Run()
}

type Motor struct {
    Id    int32
    Power int32
}

type Motors map[int32]Motor

func StartWebSocketServer() {
    s := turnpike.NewServer()

    http.Handle("/", s.Handler)

    fmt.Println("[turnpike] Listening on :8080")

    go func() {
        err := http.ListenAndServe(":8080", nil)
        if err != nil {
            panic(err)
        }

        fmt.Println("[turnpike] Server killed")
    }()

    motors := []*Motor{
        &Motor{
            Id:    2,
            Power: 0,
        },
        &Motor{
            Id:    1,
            Power: 25,
        },
        &Motor{
            Id:    5,
            Power: 50,
        },
        &Motor{
            Id:    3,
            Power: 75,
        },
    }

    fmt.Println("Running", len(motors), "motors")

    for {
        time.Sleep(time.Millisecond * 30)

        for _, x := range motors {
            if x.Power >= 100 {
                x.Power = 0
            } else {
                x.Power += 1
            }

            go s.SendEvent("ws://10.0.0.23:8080#motors", x)
        }
    }
}
