var currentState
     
const sol =   
/** @xstate-layout N4IgpgJg5mDOIC5RgDZgG4EMAuB7ATgMqZSYDEmEEAKprANbW4CKArmOwNoAMAuoqAAOuWAEtso3ADsBIAB6IATIu4A6AKyKAbAHYAzHsUBGI9oAchgDQgAnogC0OnaqNa3WvetcAWLd7NGAL6B1qgYOATEpKoAkgAiADIAomQ8-EggwmIS0rIKCEbqAJyqOkV6ZkVGRVXqejrq1nYIet56qpV6rmba3FV6WsGhaFh4RCSYqgAKAEoA8gDCSYSEMQByAOJkENJgabJZ4pIyGfkqRh2KZgE6WoVGOgFNiEbcF29FdYreRTp9Wtx1MEQiApLgIHBZGFRpEJgcREdcqcXpd1OpuNwdK8zNwBoo9EVngV2upvLitJo-PUdN5HkNwCMIuNovFkvDssc8ogfqj0ZjseTvkSruoOj8itwtN8dMZXPToUyopNZotlqtNuzESdQPk2lpVG1DBTzrptMLuGZVB4ilc3hUcVoimZgYEgA */
createMachine({
    id: "elevatorSaga",
    initial: "IDLE",
    on: {
        addTaskToQueue: {
          actions: "assignFloorToQueue",
        },
     },
    states: {
      IDLE: {
        always: {
          target: "PROCESSING",
          cond:  (context, _) => context.queue.length > 0
       }
      },
      PROCESSING: {
        entry: "processTask",
        on: {
          "done": {   
               target: "IDLE",
               actions: "deleteFirstTaskFromQueue" 
          } 
        }

      }
      },
     context: { queue: [] },
     predictableActionArguments: true,
     preserveActionOrder: true,
    }, 

    {
      actions: {
        assignFloorToQueue: assign({ 
              queue: (context,event)=> [...new Set(context.queue.concat(event.payload))]
         }),

        deleteFirstTaskFromQueue: assign({ 
          queue: (context,_)=> {
                                 context.queue.shift()
                                 return context.queue 
                 }
        }),

        processTask: (context,_) =>  {
            const nextFloor = context.queue[0]
            elevator.goToFloor(nextFloor,true)

            elevator.on("stopped_at_floor", function(floorNum) {
               if(floorNum ===  nextFloor && currentState === 'PROCESSING') { 
                  //console.log('stopped_at_floor => ', currentState )
                 // TODO: change this 
                  mService.send("done")
               }
            })
        }
      }
    })

const mService = interpret(sol)
                    .onTransition(state => { 
                      // console.log(state.event.type, state.value, 'queue: ', state.context.queue)
                      // console.table({state: state.value, queue: state.context.queue})
                      // https://github.com/statelyai/xstate/discussions/1294
                      currentState = state.value;

                    }) 
                    .start() 

elevator.on("floor_button_pressed", function(floorNum) {
      // console.log('floor_button_pressed => ', typeof floorNum, floorNum)
       mService.send( {type: "addTaskToQueue", payload: [floorNum]})
 })

floors.forEach((floor) => floor.on("up_button_pressed", function(){
        const floorNum = floor.floorNum()
      //  console.log(`floor${floorNum} up button pressed`) 
        mService.send({ type: "addTaskToQueue", payload: [floorNum, (floorNum + 1)]})
       }))

floors.forEach((floor) => floor.on("down_button_pressed", function(){
        const floorNum = floor.floorNum()
       // console.log(`floor${floorNum} down button pressed`) 
        mService.send({ type: "addTaskToQueue", payload: [floorNum, (floorNum - 1)]})
       }))
