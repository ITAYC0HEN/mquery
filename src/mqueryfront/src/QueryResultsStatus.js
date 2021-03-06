import React, { Component } from "react";
import axios from "axios/index";
import { API_URL } from "./config";

function MatchItem(props) {
    const metadata = Object.values(props.meta).map((v) => (
        <a href={v.url}>
            {" "}
            <span className="badge badge-pill badge-warning">
                {v.display_text}
            </span>
        </a>
    ));

    let matches = <span></span>;
    if (props.matches) {
        matches = Object.values(props.matches).map((v) => (
            <span key={v}>
                {" "}
                <span className="badge badge-pill badge-primary">{v}</span>
            </span>
        ));
    }

    const download_url =
        API_URL +
        "/download?job_id=" +
        encodeURIComponent(props.qhash) +
        "&ordinal=" +
        encodeURIComponent(props.ordinal) +
        "&file_path=" +
        encodeURIComponent(props.file);

    return (
        <tr>
            <td>
                <a href={download_url}>{props.file}</a>
                {matches}
                {metadata}
            </td>
        </tr>
    );
}

function ReturnExpiredJob(job_error) {
    return (
        <div className="mquery-scroll-matches">
            {job_error ? (
                <div className="alert alert-danger">{job_error}</div>
            ) : (
                <div />
            )}
            <div style={{ marginTop: "55px" }}>
                Search results expired. Please run the query once again.
            </div>
        </div>
    );
}

class QueryResultsStatus extends Component {
    constructor(props) {
        super(props);

        this.handleCancelJob = this.handleCancelJob.bind(this);
    }

    handleCancelJob() {
        axios.delete(API_URL + "/job/" + this.props.qhash);
    }

    render() {
        if (this.props.job && this.props.job.error) {
            return (
                <div className="alert alert-danger">
                    <h2>Error occurred</h2>
                    {this.props.job.error}
                </div>
            );
        }

        if (!this.props.job) {
            return (
                <div>
                    <h2>
                        <i className="fa fa-spinner fa-spin spin-big" />{" "}
                        Loading...
                    </h2>
                </div>
            );
        }

        let progress = Math.floor(
            (this.props.job.files_processed * 100) / this.props.job.total_files
        );
        let processed =
            this.props.job.files_processed + " / " + this.props.job.total_files;
        let cancel = (
            <button
                className="btn btn-danger btn-sm"
                onClick={this.handleCancelJob}
            >
                cancel
            </button>
        );

        if (!this.props.job.total_files && this.props.job.status !== "done") {
            progress = 0;
            processed = "-";
        }

        const matches = this.props.matches.map((match, index) => (
            <MatchItem
                {...match}
                qhash={this.props.qhash}
                key={match.file}
                ordinal={index}
            />
        ));

        let progressBg = "bg-info";

        if (this.props.job.status === "done") {
            progressBg = "bg-success";
            cancel = <span />;
        } else if (this.props.job.status === "cancelled") {
            progressBg = "bg-danger";
            cancel = <span />;
        } else if (this.props.job.status === "expired") {
            progressBg = "bg-secondary";
            cancel = <span />;
        }

        const lenMatches = this.props.matches.length;

        if (this.props.job.status === "expired") {
            return ReturnExpiredJob(this.props.job.error);
        }

        let results = <div />;

        if (lenMatches === 0 && this.props.job.status === "done") {
            progress = 100;
            results = <div className="alert alert-info">No matches found.</div>;
        } else if (lenMatches !== 0) {
            results = (
                <table className={"table table-striped table-bordered"}>
                    <thead>
                        <tr>
                            <th>Matches</th>
                        </tr>
                    </thead>
                    <tbody>{matches}</tbody>
                </table>
            );
        }

        return (
            <div className="mquery-scroll-matches">
                <div className="progress" style={{ marginTop: "55px" }}>
                    <div
                        className={"progress-bar " + progressBg}
                        role="progressbar"
                        style={{ width: progress + "%" }}
                    >
                        {progress}%
                    </div>
                </div>
                <div className="row m-0 pt-3">
                    <div className="col-md-2">
                        <p>
                            Matches: <span>{lenMatches}</span>
                        </p>
                    </div>
                    <div className="col-md-3">
                        Status:{" "}
                        <span className="badge badge-dark">
                            {this.props.job.status}
                        </span>
                    </div>
                    <div className="col-md-5">
                        Processed: <span>{processed}</span>
                    </div>
                    <div className="col-md-2">{cancel}</div>
                </div>
                {this.props.job.error ? (
                    <div className="alert alert-danger">
                        {this.props.job.error}
                    </div>
                ) : (
                    <div />
                )}
                {results}
            </div>
        );
    }
}

export default QueryResultsStatus;
