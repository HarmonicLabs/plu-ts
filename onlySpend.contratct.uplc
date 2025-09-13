(case
  (constr 0)
  [
    (lam _ctx
      [
        (lam _fstPair
          [
            (lam _ctxPair
              [
                (lam _ifThenElse
                  (force 
                    (case
                      (constr 0
                        [
                          [
                            [
                              (builtin equalsInteger) 
                              [
                                _fstPair 
                                _ctxPair
                              ]
                            ] 
                            (con integer 0)
                          ],

                          (delay 
                            [
                              (lam _headList
                                [
                                  (lam _tailList
                                    [
                                      (lam _dropList
                                        [
                                          (lam _sndPair
                                            (force 
                                              [
                                                (lam i 
                                                  [
                                                    (lam l 
                                                      [
                                                        [
                                                          [
                                                            _ifThenElse 
                                                            [
                                                              l 
                                                              (con integer 1)
                                                            ]
                                                          ] 
                                                          (delay 
                                                            [
                                                              (lam m 
                                                                [
                                                                  [
                                                                    (lam o 
                                                                      (lam p 
                                                                        (force 
                                                                          [
                                                                            [
                                                                              [
                                                                                _ifThenElse 
                                                                                [
                                                                                  [
                                                                                    (builtin equalsInteger) 
                                                                                    [
                                                                                      _fstPair 
                                                                                      [
                                                                                        (builtin unConstrData) 
                                                                                        o
                                                                                      ]
                                                                                    ]
                                                                                  ] 
                                                                                  (con integer 0)
                                                                                ]
                                                                              ] 
                                                                              (delay 
                                                                                (con unit ())
                                                                              )
                                                                            ] 
                                                                            (delay (error)
                                                                            )
                                                                          ]
                                                                        )
                                                                      )
                                                                    ) 
                                                                    [
                                                                      _headList 
                                                                      [
                                                                        [
                                                                          _dropList 
                                                                          (con integer 0)
                                                                        ] 
                                                                        m
                                                                      ]
                                                                    ]
                                                                  ] 
                                                                  [
                                                                    _headList 
                                                                    [
                                                                      [
                                                                        _dropList 
                                                                        (con integer 1)
                                                                      ] 
                                                                      m
                                                                    ]
                                                                  ]
                                                                ]
                                                              ) 
                                                              [
                                                                _sndPair 
                                                                i
                                                              ]
                                                            ]
                                                          )
                                                        ] 
                                                        (delay (error)
                                                        )
                                                      ]
                                                    ) 
                                                    [
                                                      (builtin equalsInteger) 
                                                      [
                                                        _fstPair 
                                                        i
                                                      ]
                                                    ]
                                                  ]
                                                ) 
                                                [
                                                  (builtin unConstrData) 
                                                  [
                                                    _headList 
                                                    [
                                                      [
                                                        _dropList 
                                                        (con integer 2)
                                                      ] 
                                                      [
                                                        _sndPair 
                                                        _ctxPair
                                                      ]
                                                    ]
                                                  ]
                                                ]
                                              ]
                                            )
                                          ) 
                                          (force (force (builtin sndPair)))
                                        ]
                                      ) 
                                      [
                                        (lam _dropList 
                                          [
                                            _dropList 
                                            _dropList
                                          ]
                                        ) 
                                        (lam _dropList 
                                          (lam _sndPair 
                                            (lam i 
                                              (force 
                                                [
                                                  [
                                                    [
                                                      _ifThenElse 
                                                      [
                                                        [
                                                          (builtin lessThanInteger) 
                                                          (con integer 4)
                                                        ] 
                                                        _sndPair
                                                      ]
                                                    ] 
                                                    (delay 
                                                      [
                                                        [
                                                          [
                                                            _dropList 
                                                            _dropList
                                                          ] 
                                                          [
                                                            [
                                                              (builtin addInteger) 
                                                              (con integer -4)
                                                            ] 
                                                            _sndPair
                                                          ]
                                                        ] 
                                                        [
                                                          (lam l 
                                                            [
                                                              _tailList 
                                                              [
                                                                _tailList 
                                                                [
                                                                  _tailList 
                                                                  [
                                                                    _tailList 
                                                                    l
                                                                  ]
                                                                ]
                                                              ]
                                                            ]
                                                          ) 
                                                          i
                                                        ]
                                                      ]
                                                    )
                                                  ] 
                                                  (delay 
                                                    (force 
                                                      [
                                                        [
                                                          [
                                                            _ifThenElse 
                                                            [
                                                              [
                                                                (builtin equalsInteger) 
                                                                (con integer 0)
                                                              ] 
                                                              _sndPair
                                                            ]
                                                          ] 
                                                          (delay 
                                                            i
                                                          )
                                                        ] 
                                                        (delay 
                                                          (force 
                                                            [
                                                              [
                                                                [
                                                                  _ifThenElse 
                                                                  [
                                                                    [
                                                                      (builtin equalsInteger) 
                                                                      (con integer 1)
                                                                    ] 
                                                                    _sndPair
                                                                  ]
                                                                ] 
                                                                (delay 
                                                                  [
                                                                    _tailList 
                                                                    i
                                                                  ]
                                                                )
                                                              ] 
                                                              (delay 
                                                                (force 
                                                                  [
                                                                    [
                                                                      [
                                                                        _ifThenElse 
                                                                        [
                                                                          [
                                                                            (builtin equalsInteger) 
                                                                            (con integer 2)
                                                                          ] 
                                                                          _sndPair
                                                                        ]
                                                                      ] 
                                                                      (delay 
                                                                        [
                                                                          (lam l 
                                                                            [
                                                                              _tailList 
                                                                              [
                                                                                _tailList 
                                                                                l
                                                                              ]
                                                                            ]
                                                                          ) 
                                                                          i
                                                                        ]
                                                                      )
                                                                    ] 
                                                                    (delay 
                                                                      [
                                                                        (lam l 
                                                                          [
                                                                            _tailList 
                                                                            [
                                                                              _tailList 
                                                                              [
                                                                                _tailList 
                                                                                l
                                                                              ]
                                                                            ]
                                                                          ]
                                                                        ) 
                                                                        i
                                                                      ]
                                                                    )
                                                                  ]
                                                                )
                                                              )
                                                            ]
                                                          )
                                                        )
                                                      ]
                                                    )
                                                  )
                                                ]
                                              )
                                            )
                                          )
                                        )
                                      ]
                                    ]
                                  ) 
                                  (force (builtin tailList))
                                ]
                              ) 
                              (force (builtin headList))
                            ]
                          ),

                          (delay (error)
                          )
                        ]
                      )
                      [
                        _ifThenElse
                      ]

                    )
                  )
                ) 
                (force (builtin ifThenElse))
              ]
            ) 
            [
              (builtin unConstrData) 
              _ctx
            ]
          ]
        ) 
        (force (force (builtin fstPair)))
      ]
    ),

    (con integer 42)
  ]

)