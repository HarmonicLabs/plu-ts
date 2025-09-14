(case
  (constr 0)
  [
    (lam _ctxData
      (force 
        [
          (lam _purpUnconstrPair
            [
              (lam _isPurpIdx
                (case
                  (constr 0
                    [
                      [
                        _isPurpIdx 
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
              [
                (builtin equalsInteger) 
                [
                  (force (force (builtin fstPair))) 
                  _purpUnconstrPair
                ]
              ]
            ]
          ) 
          [
            (builtin unConstrData) 
            [
              (force (builtin headList)) 
              [
                (lam _purpUnconstrPair 
                  [
                    (lam _isPurpIdx 
                      [
                        _isPurpIdx 
                        [
                          _isPurpIdx 
                          _purpUnconstrPair
                        ]
                      ]
                    ) 
                    (force (builtin tailList))
                  ]
                ) 
                [
                  (force (force (builtin sndPair))) 
                  [
                    (builtin unConstrData) 
                    _ctxData
                  ]
                ]
              ]
            ]
          ]
        ]
      )
    ),

    (con integer 42)
  ]

)