
       
    const sol =   
/** @xstate-layout N4IgpgJg5mDOIC5QFsB0BJAIgGQKIGIAzAGwHtSAnAfQCMBXAFwdIDsqAHCuWAbQAYAuolDtSsAJYNxrYSAAeiAIwA2ZamUBODQHYNADgCsegMz6ALMb0AaEAE8l2s6jN9lB48sV8ATN41mNbwBfIJs0ADFsAHkogCV8fiEkEFEJKRlkhQRvM21ULT1lb2VtPj1zSxt7BD1FZ209MwtFMwNtA0UNAxDQkBZSCDhZZFlUyWkWWSyAWmUqxFmQsIwcXFGxcYzQLLNveYQvPVQGxW9FPTOyg09FJZAI6Lj1tImpxA81bwbd7VOXb2MTX2ihBqG8tV8rWUhUaGh6QSAA */
createMachine({
        "id": "m",
        "initial": "IDLE",
        "states": {
          "IDLE": {
            "on": {
              "floor_button_press": {
               "target": "FLOOR",
                actions: "assignFloor"
              },
           }
          },
          "FLOOR": {
            "always": {
               "target": "IDLE",
                actions: "goToFloor"
           }
          },
        },
         context: { floor: 0},
         predictableActionArguments: true,
         preserveActionOrder: true,
        },
    {
    actions: {
       assignFloor: assign({ floor: (context, event ) => event.payload }),
       goToFloor: (context,_)=> { elevator.goToFloor(context.floor) }
    }

   })

     const mService = interpret(sol)
                        .onTransition(state => { 
                          console.log(state.value, state.context.floor)
                        }) 
                        .start() 

     elevator.on("floor_button_pressed", function(floorNum) {
           console.log(typeof floorNum, floorNum)
           mService.send( {type:"floor_button_press", payload: floorNum})
     })
   
 