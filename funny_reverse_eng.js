[
	(lam dataListNil 
		[
			(lam dataListNil 
				[
					(lam matchList 
						[
							(lam z_combinator 
								[
									(lam precList 
										[
											(lam foldr 
												[
													(lam pmapListToDataList
														[
															(lam nilPairData
																[
																	(lam nilPairData
																		[
																			(lam pmapListToDataMap // ... -> [(#44deadbeef,#a142beef1820)] // list( pair( data, data ) ) -> ...
																				[
																					(builtin mapData) // list( pair( data, data) ) -> data
																					[
																						[
																							pmapListToDataMap // func -> [(#44deadbeef,#a142beef1820)] // list( pair( data, data ) ) -> ...
																							(lam pairElement // pair( dataB, data )
																								[
																									[
																										(builtin mkPairData) 
																										[
																											(builtin bData) 
																											[
																												(builtin unBData) 
																												[(force (force (builtin fstPair))) pairElement]
																											]
																										]
																									]
                                                  [
                                                    (lam snd_asMap 
                                                      [
                                                        (builtin listData) 
                                                        [
                                                          [
                                                            pmapListToDataList 
                                                            (lam p // pair( dataB , dataI )
                                                              [
                                                                [
                                                                  (builtin mkPairData)
                                                                  [
                                                                    (builtin bData)
                                                                    [
                                                                      (builtin unBData) 
                                                                      [(force (force (builtin fstPair))) p]
                                                                    ]
                                                                  ]
                                                                ]
                                                                [
                                                                  (builtin iData) 
                                                                  [
                                                                    (builtin unIData) 
                                                                    [(force (force (builtin sndPair))) p]
                                                                  ]
                                                                ]
                                                              ]
                                                            )
                                                          ]
                                                          snd_asMap
                                                        ]
                                                      ]
                                                    ) 
                                                    [
                                                      (lam _o [(builtin unMapData) _o]) 
                                                      [(force (force (builtin sndPair))) pairElement]
                                                    ]
                                                  ]
                                                ]
                                              )
                                            ]
                                            ( con [(con list) (con [[(con pair) (con data)] (con data))] [(#44deadbeef,#a142beef1820)] )
                                          ]
                                        ]
                                      ) 
                                      (lam _mapFunc 
                                        [
                                          [
                                            foldr 
                                            (lam elem 
                                              (lam accum
                                                [
                                                  [
                                                    (force (builtin mkCons)) 
                                                    [_mapFunc elem]
                                                  ] 
                                                  accum
                                                ]
                                              )
                                            )
                                          ] 
                                          nilPairData
                                        ]
                                      )
                                    ]
                                  ) 
                                  nilPairData
                                ]
                              )
                              [(builtin mkNilPairData) ( con unit () )]
                            ]
                          )
                          (lam mapFunc
                            [
                              [
                                foldr 
                                (lam elem
                                  (lam accum
                                    [
                                      [(force (builtin mkCons)) [mapFunc elem]] 
                                      accum
                                    ]
                                  )
                                )
                              ] 
                              dataListNil // not supposed to be here !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                              // pmap( fromT, **toT** )
                              // `toT` decides the
                            ]
                          )
                        ]
                      ) 
                      (lam reduceFunc 
                        (lam _accum 
                          [
                            [
                              precList
                              (lam _self _accum)
                            ] 
                            (lam _self 
                              (lam _head 
                                (lam _tail
                                  [
                                    [reduceFunc _head] [_self _tail]
                                  ]
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
                    (lam _e 
                      (lam _f 
                        (lam _accum 
                          (lam _h 
                            [
                              (lam _i 
                                [
                                  [
                                    [
                                      matchList
                                      [_f _i]
                                    ]
                                    [_accum _i]
                                  ]
                                  _h
                                ]
                              )
                              [
                                [_e _f]
                                _accum
                              ]
                            ]
                          )
                        )
                      )
                    )
                  ]
                ]
              )
              (lam _d // Z combinator
                [
                  (lam _e 
                    [
                      _d
                      (lam _f 
                        [[_e _e] _f]
                      )
                    ]
                  )
                  (lam _e 
                    [
                      _d
                      (lam _f [[_e _e] _f])
                    ]
                  )
                ]
              )
            ]
          )
          (lam caseNil // b
            (lam caseCons // elemT -> list( elemsT ) -> b
              (lam precList // list a
                (force 
                  [
                    [
                      [(force (force (builtin chooseList))) precList]
                      (delay caseNil)
                    ]
                    (delay 
                      [
                        [
                          caseCons
                          [ (force (builtin headList)) precList ]
                        ]
                        [(force (builtin tailList)) precList]
                      ]
                    )
                  ]
                )
              )
            )
          )
        ]
      ) 
      dataListNil
    ]
  ) 
  [(builtin mkNilData) ( con unit () )]
]
