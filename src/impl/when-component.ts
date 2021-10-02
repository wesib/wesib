import { AfterEvent, EventEmitter, mapAfter_, OnEvent, onEventBy, trackValue } from '@proc7ts/fun-events';
import { ComponentContext } from '../component';

export class WhenComponent<T extends object> {

  readonly onCreated: OnEvent<[ComponentContext<T>]>;
  readonly readNotifier: AfterEvent<[ComponentNotifier<T>]>;

  constructor() {

    const currentRev = trackValue(0);
    const created = new EventEmitter<[ComponentContext<T>, number]>();

    this.onCreated = onEventBy(receiver => {

      const receiverRev = currentRev.it + 1;

      created.on({
        supply: receiver.supply,
        receive: (eventContext, componentContext, notifiedRev) => {
          if (notifiedRev < receiverRev) {
            // Notify only receivers added after the last notification
            receiver.receive(
                {
                  onRecurrent(recurrentReceiver) {
                    eventContext.onRecurrent(recurrentContext => recurrentReceiver(recurrentContext));
                  },
                },
                componentContext,
            );
          }
        },
      });

      ++currentRev.it;
    });
    this.readNotifier = currentRev.read.do(
        mapAfter_(
            rev => (context, notifiedRev) => {
              created.send(context, notifiedRev);

              return rev;
            },
        ),
    );
  }

}

export type ComponentNotifier<T extends object> = (
    this: void,
    context: ComponentContext<T>,
    notifiedRev: number,
) => number;
