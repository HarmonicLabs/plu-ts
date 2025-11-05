(program 1.1.0

(case
  (constr 0
    [
      [
        (builtin addInteger) 
        (con integer -1)
      ],

      [
        (builtin addInteger) 
        (con integer -2)
      ],

      [
        (builtin lessThanInteger) 
        (con integer 1)
      ],

      (force (builtin ifThenElse))
    ]
  )
  [
    (lam a 
      (lam b 
        (lam c 
          (lam d 
            [
              (lam e 
                [
                  e 
                  e
                ]
              ) 
              (lam e 
                (lam f 
                  (force 
                    [
                      [
                        [
                          d 
                          [
                            c 
                            f
                          ]
                        ] 
                        (delay 
                          [
                            [
                              (builtin addInteger) 
                              [
                                [
                                  e 
                                  e
                                ] 
                                [
                                  b 
                                  f
                                ]
                              ]
                            ] 
                            [
                              [
                                e 
                                e
                              ] 
                              [
                                a 
                                f
                              ]
                            ]
                          ]
                        )
                      ] 
                      (delay 
                        f
                      )
                    ]
                  )
                )
              )
            ]
          )
        )
      )
    )
  ]

)
)