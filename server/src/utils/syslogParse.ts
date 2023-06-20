import * as dgram from "dgram";

const SEVERITY = [
    "emerg",
    "alert",
    "crit",
    "err",
    "warning",
    "notice",
    "info",
    "debug",
];

const FACILITY = [
    "kern",
    "user",
    "mail",
    "daemon",
    "auth",
    "syslog",
    "lpr",
    "news",
    "uucp",
    "cron",
    "authpriv",
    "ftp",
    "ntp",
    "logaudit",
    "logalert",
    "clock",
    "local0",
    "local1",
    "local2",
    "local3",
    "local4",
    "local5",
    "local6",
    "local7",
];

const parsePRI = (raw: string): number[] => {
    // PRI means Priority, includes Facility and Severity
    // e.g. 00110111 =  facility: 00110, severity: 111
    // e.g. facility = 6, severity=7

    // To reverse
    // Grab last 3 bits
    let severity = parseInt(raw) % 8;
    // Shift last 3 bits to right (and throw away)
    let facility = parseInt(raw) >> 3;
    return [facility, severity];
};

/**
 * Given facility code, return its name
 * @param {number} code facility code
 * @return {string} facility name
 */
const facility = (code: number) => {
    if (code >= 0 && code <= 23) return FACILITY[code];
    else "INVALID";
};

/**
 * Given severity code, return its name
 * @param {number} code severity code
 * @return {string} severity name
 */
const severity = (code: number) => {
    if (code >= 0 && code <= 7) return SEVERITY[code];
    else "INVALID";
};

const syslogParse = (msg: string, rinfo: dgram.AddressInfo) => {
    // https://tools.ietf.org/html/rfc5424
    // e.g. <PRI>timestamp hostname tag: info
    msg = msg + "";
    let tagIndex = msg.indexOf(": ");
    if (tagIndex == -1) {
        return {
            facility: undefined,
            facilityCode: undefined,
            severity: undefined,
            severityCode: undefined,
            tag: undefined,
            timestamp: new Date(),
            hostname: undefined,
            address: rinfo.address,
            family: rinfo.family,
            port: rinfo.port,
            msg: msg,
        };
    }

    let format = msg.slice(0, tagIndex);
    let priIndex = format.indexOf(">");
    let pri: string | number[] = format.slice(1, priIndex - 1);
    pri = parsePRI(pri);
    let lastSpaceIndex = format.lastIndexOf(" ");
    let tag = format.slice(lastSpaceIndex + 1);
    let last2SpaceIndex = format.lastIndexOf(" ", lastSpaceIndex - 1); // hostname cannot contain ' '
    let hostname = format.substring(last2SpaceIndex + 1, lastSpaceIndex);
    // timestamp is complex because don't know if it has year
    let timestamp: string | Date = format.substring(
        priIndex + 1,
        last2SpaceIndex
    );
    timestamp = new Date(timestamp);
    timestamp.setFullYear(new Date().getFullYear()); // fix year to now
    return {
        facility: facility(pri[0]),
        facilityCode: pri[0],
        severity: severity(pri[1]),
        severityCode: pri[1],
        tag: tag,
        timestamp: timestamp,
        hostname: hostname,
        address: rinfo.address,
        family: rinfo.family,
        port: rinfo.port,
        msg: msg.slice(tagIndex + 2),
    };
};

export default syslogParse;