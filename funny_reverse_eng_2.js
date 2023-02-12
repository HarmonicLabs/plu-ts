[
  (lam nilData
    [
      (lam pmatchList 
        [
          (lam z_combinator 
            [
              (lam precList
                [
                  (lam pfoldr 
                    [
                      (lam innerPmap
                        [
                          (lam pmapToListData
                            [
                              (lam nilPairData
                                [
                                  (lam pmapToListPairData
                                    [
                                      (builtin mapData) 
                                      [
                                        [
                                          pmapToListPairData 
                                          (lam pairData 
                                            [
                                              [
                                                (builtin mkPairData)
                                                [
                                                  (builtin bData) 
                                                  [
                                                    (builtin unBData) 
                                                    [(force (force (builtin fstPair))) pairData]
                                                  ]
                                                ]
                                              ]
                                              [
                                                (lam snd_asListPairData
                                                  [
                                                    (builtin listData) 
                                                    [
                                                      [
                                                        pmapToListData
                                                        (lam pairDataElem
                                                          [
                                                            [
                                                              (builtin mkPairData) 
                                                              [
                                                                (builtin bData)
                                                                [
                                                                  (builtin unBData) 
                                                                  [(force (force (builtin fstPair))) pairDataElem]
                                                                ]
                                                              ]
                                                            ]
                                                            [
                                                              (builtin iData)
                                                              [
                                                                (builtin unIData)
                                                                [(force (force (builtin sndPair))) pairDataElem]
                                                              ]
                                                            ]
                                                          ]
                                                        )
                                                      ]
                                                      snd_asListPairData
                                                    ]
                                                  ]
                                                )
                                                [
                                                  (lam snd_asMap [(builtin unMapData) snd_asMap])
                                                  [(force (force (builtin sndPair))) pairData]
                                                ]
                                              ]
                                            ]
                                          )
                                        ]
                                        ( con [(con list) (con [[(con pair) (con data)] (con data))] [(#44deadbeef,#a142beef1820)] )
                                      ]
                                    ]
                                  )
                                  (lam mapFunc [[innerPmap mapFunc] nilPairData])
                                ]
                              )
                              [(builtin mkNilPairData) ( con unit () )]
                            ]
                          )
                          (lam mapFunc [[innerPmap mapFunc] nilData])
                        ]
                      )
                      (lam mapFunc 
                        [
                          pfoldr
                          (lam elem 
                            [
                              (force (builtin mkCons))
                              [mapFunc elem]
                            ]
                          )
                        ]
                      )
                    ]
                  )
                  (lam reduceFunc
                    (lam accum
                      [
                        [
                          precList
                          (lam _self accum)
                        ]
                        (lam _self 
                          (lam head
                            (lam tail
                              [[reduceFunc head] [_self tail]]
                            )
                          )
                        )
                      ]
                    )
                  )
                ]
              ) 
              [
                z_combinator
                (lam _self
                  (lam matchNil
                    (lam matchCons
                      (lam lst
                        [
                          (lam finalSelf
                            [
                              [[pmatchList [matchNil finalSelf]] [matchCons finalSelf]]
                              lst
                            ]
                          ) 
                          [[_self matchNil] matchCons]
                        ]
                      )
                    )
                  )
                )
              ]
            ]
          )
          (lam °c // z comninator
            [
              (lam _d 
                [
                  _c
                  (lam _e 
                    [[_d _d] _e]
                  )
                ]
              )
              (lam _d 
                [
                  _c
                  (lam _e 
                    [[_d _d] _e]
                  )
                ]
              )
            ]
          )
        ]
      )
      (lam caseNil 
        (lam caseCons 
          (lam lst 
            (force 
              [
                [
                  [
                    (force (force (builtin chooseList))) 
                    lst
                  ]
                  (delay caseNil)
                ]
                (delay 
                  [
                    [
                      caseCons
                      [ (force (builtin headList)) lst ]
                    ] 
                    [(force (builtin tailList)) lst ]
                  ]
                )
              ]
            )
          )
        )
      )
    ]
  ) 
  [(builtin mkNilData) ( con unit () )]
]