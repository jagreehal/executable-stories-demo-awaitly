flowchart LR
  GU["getUser"] -->|ok| VU["validateUser"]
  VU["validateUser"] -->|ok| GO["getOrders"]
  GO["getOrders"] -->|ok| Done((Success))
  GU -->|err| GUE["NOT_FOUND"]
  VU -->|err| VUE["INVALID_USER"]
  GO -->|err| GOE["FETCH_ERROR"]

  classDef stepStyle fill:#e1f5fe,stroke:#01579b
  classDef errorStyle fill:#ffcdd2,stroke:#c62828
  classDef successStyle fill:#c8e6c9,stroke:#2e7d32
  class GU,VU,GO stepStyle
  class GUE,VUE,GOE errorStyle
  class Done successStyle