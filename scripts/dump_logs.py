#!/usr/bin/env python
import csv
import dateutil.parser


def parse_time(date, timestr):
    timeobj = dateutil.parser.parse(timestr)
    datetime = date.replace(
        minute=timeobj.minute,
        hour=timeobj.hour)
    return datetime.isoformat()


def parse_log(fname):
    logs = []
    date = None
    state = None
    with open(fname, 'r') as f:
        for l in f:
            t, l = l[0], l[1:]
            l = l.rstrip('\n').rstrip('\r').rstrip('\0')
            if t == 's' or t == 'd':
                date = dateutil.parser.isoparse(l)
                if t == 's':
                    state = 0
            elif t == 't' and l[-1] in {'o', 'f'}:
                state = int(l[-1] == 'o')
                datetime = parse_time(date, l[:5])
                if logs and logs[-1][0] == datetime:
                    _, temp1, temp2, _ = logs[-1]
                    logs[-1] = datetime, temp1, temp2, state
                else:
                    logs.append((datetime, None, None, state))
            elif t == 't':
                datetime = parse_time(date, l[:5])
                temp1 = l[5:10]
                temp2 = l[10:15]
                if logs and logs[-1][0] == datetime:
                    _, _, _, state = logs[-1]
                    logs[-1] = datetime, temp1, temp2, state
                else:
                    logs.append((datetime, temp1, temp2, state))
            else:
                raise ValueError('Invalid data')
    return logs


if __name__ == '__main__':
    log = parse_log('/home/jonas/Downloads/history.log')
    with open('history.csv', 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(('datetime', 'temp', 'user temp', 'state'))
        for d in log:
            writer.writerow(d)
