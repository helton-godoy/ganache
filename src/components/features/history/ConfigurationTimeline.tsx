'use client';

import { useGetCommitDiff, useGetConfigHistory } from '@/api/generated/default/default';
import { GitCommit } from '@/api/generated/model/gitCommit';
import { GitDiff } from '@/api/generated/model/gitDiff';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { useState } from 'react';

interface ConfigurationTimelineProps {
  className?: string;
}

const formatDiff = (diff: GitDiff) => {
  if (!diff || !diff.files || diff.files.length === 0) return null;

  return (
    <div className="space-y-6">
      {diff.files.map((file, fileIndex) => (
        <div key={fileIndex} className="rounded-md border border-slate-800 overflow-hidden">
          <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-300 font-semibold">{file.filename}</span>
            </div>
            <div className="flex gap-4 text-xs font-medium">
              <span className="text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded flex items-center gap-1">
                +{file.additions}
              </span>
              <span className="text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded flex items-center gap-1">
                -{file.deletions}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs border-collapse">
              <tbody>
                {file.diff_content.split('\n').map((line, i) => {
                  let lineContentClass = "text-slate-400 px-4 py-0.5 w-full whitespace-pre";
                  let lineNumClass = "text-slate-600 select-none text-right pr-3 pl-3 py-0.5 border-r border-slate-800/50 w-[1%] whitespace-nowrap bg-slate-900/30";
                  let rowClass = "hover:bg-slate-800/20";

                  if (line.startsWith('+')) {
                    lineContentClass = "text-emerald-300 bg-emerald-950/20 px-4 py-0.5 w-full whitespace-pre";
                    rowClass = "bg-emerald-950/10 hover:bg-emerald-950/20";
                    lineNumClass += " text-emerald-700";
                  } else if (line.startsWith('-')) {
                    lineContentClass = "text-rose-300 bg-rose-950/20 px-4 py-0.5 w-full whitespace-pre";
                    rowClass = "bg-rose-950/10 hover:bg-rose-950/20";
                    lineNumClass += " text-rose-700";
                  } else if (line.startsWith('@@')) {
                    lineContentClass = "text-blue-400 bg-slate-900/50 px-4 py-1 w-full whitespace-pre font-semibold";
                    rowClass = "bg-slate-900/50";
                    lineNumClass += " text-blue-800";
                  }

                  return (
                    <tr key={i} className={rowClass}>
                      <td className={lineNumClass}>{i + 1}</td>
                      <td className={lineContentClass}>{line}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export function ConfigurationTimeline({ className }: ConfigurationTimelineProps) {
  const [selectedCommit, setSelectedCommit] = useState<GitCommit | null>(null);
  const [authorFilter, setAuthorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const PAGE_SIZE = 10; // Assuming a page size for pagination
  const [offset, setOffset] = useState(0);
  const [dateAfter, setDateAfter] = useState('');
  const [dateBefore, setDateBefore] = useState('');

  const { data: commitsResponse, isLoading, error, refetch } = useGetConfigHistory({
    limit: PAGE_SIZE,
    offset: offset,
    author_filter: authorFilter || undefined,
    date_from: dateAfter || undefined,
    date_to: dateBefore || undefined,
  });

  const { data: diffResponse, isLoading: diffLoading } = useGetCommitDiff(
    selectedCommit?.id || '',
    {
      query: {
        enabled: !!selectedCommit?.id,
      },
    }
  );

  // Early return for error state
  if (error) {
    return (
      <Card className="w-full bg-slate-900/50 border-slate-800 backdrop-blur-sm text-slate-100 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Failed to load configuration history: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  // Early return for loading state
  if (isLoading) {
    return (
      <Card className="w-full bg-slate-900/50 border-slate-800 backdrop-blur-sm text-slate-100 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            System History
          </CardTitle>
          <CardDescription className="text-slate-400">
            Chronological timeline of all system configuration changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <p className="ml-3 text-slate-300">Loading history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Now that isLoading is false and no error, we can safely access data
  const commits = commitsResponse?.data || [];
  const diff = diffResponse?.data;

  const filteredCommits = commits.filter((commit: GitCommit) => {
    const matchesAuthor = !authorFilter || commit.author.toLowerCase().includes(authorFilter.toLowerCase());
    const matchesDate = !dateFilter || commit.date.includes(dateFilter);
    return matchesAuthor && matchesDate;
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="w-full bg-slate-900/50 border-slate-800 backdrop-blur-sm text-slate-100 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          System History
        </CardTitle>
        <CardDescription className="text-slate-400">
          Chronological timeline of all system configuration changes
        </CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Input
            placeholder="Filter by author..."
            value={authorFilter}
            onChange={(e) => {
              setAuthorFilter(e.target.value);
              setOffset(0); // Reset offset on filter change
            }}
            className="bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-500"
          />
          <Input
            type="date"
            value={dateAfter}
            onChange={(e) => {
              setDateAfter(e.target.value);
              setOffset(0); // Reset offset on filter change
            }}
            className="bg-slate-950/50 border-slate-800 text-slate-200"
          />
          <Input
            type="date"
            value={dateBefore}
            onChange={(e) => {
              setDateBefore(e.target.value);
              setOffset(0); // Reset offset on filter change
            }}
            className="bg-slate-950/50 border-slate-800 text-slate-200"
          />
          <Button
            onClick={() => refetch()}
            variant="secondary"
            className="bg-blue-600 hover:bg-blue-500 text-white transition-all duration-300"
          >
            Refresh Logs
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-800" />
          <div className="space-y-8 pl-10 pt-4">
            {commits.length === 0 ? (
              <div className="text-center py-12 text-slate-500 italic">No configuration changes found</div>
            ) : (
              filteredCommits.map((commit) => (
                <div key={commit.id} className="relative group transition-all duration-300">
                  <div className="absolute -left-10 top-2 w-4 h-4 rounded-full bg-slate-950 border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:scale-125 transition-transform" />
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-blue-400">
                            {commit.id.substring(0, 7)}
                          </Badge>
                          <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                            <Calendar size={12} />
                            {new Date(commit.date).toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {commit.author}
                          </span>
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed font-medium">
                          {commit.message}
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCommit(commit)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 transition-colors"
                          >
                            View Visual Diff
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[85vh] bg-slate-950 border-slate-800 text-slate-100 p-0 overflow-hidden shadow-2xl">
                          <DialogHeader className="p-6 pb-2 border-b border-slate-800">
                            <DialogTitle className="flex items-center gap-3">
                              Visual Comparison
                              <Badge variant="outline" className="font-mono text-blue-400">
                                {commit.id.substring(0, 7)}
                              </Badge>
                            </DialogTitle>
                            <p className="text-sm text-slate-400 mt-2">{commit.message}</p>
                          </DialogHeader>
                          <div className="overflow-auto p-4 bg-slate-950/50">
                            {diffLoading ? (
                              <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                              </div>
                            ) : (
                              <div className="font-mono text-xs leading-relaxed rounded-lg overflow-hidden border border-slate-800 bg-slate-900/50">
                                {diff ? formatDiff(diff) : <div className="p-4 text-slate-500 italic">No diff content available</div>}
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                className="border-slate-800 hover:bg-slate-800 disabled:opacity-30 transition-all"
              >
                Previous
              </Button>
              <span className="text-xs text-slate-500 font-medium tracking-wider uppercase">
                Page {Math.floor(offset / PAGE_SIZE) + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!commits || commits.length < PAGE_SIZE}
                onClick={() => setOffset(offset + PAGE_SIZE)}
                className="border-slate-800 hover:bg-slate-800 disabled:opacity-30 transition-all"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}