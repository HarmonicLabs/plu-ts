(case
  (constr 0)
  [
    (lam _ctxData
      (force 
        (case
          (constr 0
            [
              [
                [
                  (builtin equalsInteger) 
                  [
                    (force (force (builtin fstPair))) 
                    [
                      (builtin unConstrData) 
                      [
                        (force (builtin headList)) 
                        [
                          (lam _tailList
                            [
                              _tailList 
                              [
                                _tailList 
                                [
                                  (force (force (builtin sndPair))) 
                                  [
                                    (builtin unConstrData) 
                                    _ctxData
                                  ]
                                ]
                              ]
                            ]
                          ) 
                          (force (builtin tailList))
                        ]
                      ]
                    ]
                  ]
                ] 
                (con integer 1)
              ],

              (delay 
                (con unit ())
              ),

              (delay (error)
              )
            ]
          )
          [
            (force (builtin ifThenElse))
          ]

        )
      )
    ),

    (con integer 42)
  ]

)