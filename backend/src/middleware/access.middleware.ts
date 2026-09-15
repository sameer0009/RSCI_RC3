import { RequestHandler } from 'express';
import prisma from '../config/database';

// Object ownership is required in addition to a management role.
export const ownsResource = (kind: 'problem' | 'testCase' | 'testCaseGroup' | 'contest', param = 'id'): RequestHandler => async (req, res, next) => {
  try {
    if (!req.user) return void res.status(401).json({ success: false });
    if (req.user.role === 'ADMIN') return next();
    const id = req.params[param];
    let owner: string | undefined;
    if (kind === 'problem') owner = (await prisma.problem.findUnique({ where: { id }, select: { createdBy: true } }))?.createdBy;
    if (kind === 'contest') owner = (await prisma.contest.findUnique({ where: { id }, select: { createdBy: true } }))?.createdBy;
    if (kind === 'testCase') owner = (await prisma.testCase.findUnique({ where: { id }, include: { problem: { select: { createdBy: true } } } }))?.problem.createdBy;
    if (kind === 'testCaseGroup') owner = (await prisma.testCaseGroup.findUnique({ where: { id }, include: { problem: { select: { createdBy: true } } } }))?.problem.createdBy;
    if (owner !== req.user.id) return void res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not manage this resource' } });
    next();
  } catch (error) { next(error); }
};

export const classroomAccess = (assignment = false, management = false): RequestHandler => async (req, res, next) => {
  try {
    if (!req.user) return void res.status(401).json({ success: false });
    if (req.user.role === 'ADMIN') return next();
    const classroomId = assignment
      ? (await prisma.assignment.findUnique({ where: { id: req.params.assignmentId }, select: { classroomId: true } }))?.classroomId
      : req.params.id;
    if (!classroomId) return void res.status(404).json({ success: false });
    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId }, select: { instructorId: true } });
    if (classroom?.instructorId === req.user.id) return next();
    if (!management && classroom && await prisma.classroomMember.findUnique({ where: { classroomId_userId: { classroomId, userId: req.user.id } } })) return next();
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have access to this classroom' } });
  } catch (error) { next(error); }
};

import { visibleProblems } from '../utils/problem-access';
export const readableProblem = (source: 'id' | 'slug' | 'body' = 'id'): RequestHandler => async (req, res, next) => {
  try {
    const value = source === 'body' ? req.body.problemId : req.params[source];
    if (typeof value !== 'string' || !value) return void res.status(400).json({ success: false });
    const identity = source === 'slug' ? { OR: [{ slug: value }, { id: value }] } : { id: value };
    const problem = await prisma.problem.findFirst({ where: { AND: [identity, visibleProblems(req.user)] }, select: { id: true } });
    if (!problem) return void res.status(404).json({ success: false, error: { code: 'PROBLEM_NOT_FOUND', message: 'Problem not found' } });
    next();
  } catch (error) { next(error); }
};

// Community content is visible only for published practice problems, preventing
// solutions/comments from becoming an alternate path to private contest material.
export const communityAccess = (kind: 'problem' | 'solution', source: 'query' | 'body' | 'params', key: string): RequestHandler => async (req, res, next) => {
  try {
    const id = (req[source] as any)[key];
    if (typeof id !== 'string') return void res.status(400).json({ success: false });
    const problemId = kind === 'problem' ? id : (await prisma.solution.findUnique({ where: { id }, select: { problemId: true } }))?.problemId;
    if (!problemId) return void res.status(404).json({ success: false });
    const problem = await prisma.problem.findFirst({ where: { id: problemId, isGlobal: true, status: 'PUBLISHED' }, select: { id: true } });
    if (!problem) return void res.status(404).json({ success: false, error: { message: 'Community discussion is not available for this problem' } });
    next();
  } catch (error) { next(error); }
};

export const contestVisibility: RequestHandler = async (req, res, next) => {
  try {
    const contest = await prisma.contest.findUnique({ where: { id: req.params.id }, select: { id: true, isPublic: true, createdBy: true } });
    if (!contest) return void res.status(404).json({ success: false });
    if (contest.isPublic || req.user?.role === 'ADMIN' || contest.createdBy === req.user?.id) return next();
    if (req.user && await prisma.contestParticipant.findUnique({ where: { contestId_userId: { contestId: contest.id, userId: req.user.id } } })) return next();
    res.status(403).json({ success: false, error: { message: 'Private contest access requires registration' } });
  } catch (error) { next(error); }
};

export const problemSelection: RequestHandler = async (req, res, next) => {
  try {
    if (!req.body.problemIds) return next();
    const ids = req.body.problemIds;
    if (!Array.isArray(ids) || ids.length > 100 || ids.some(id => typeof id !== 'string')) return void res.status(400).json({ success: false });
    if (req.user?.role === 'ADMIN') return next();
    const unique = [...new Set(ids)] as string[];
    const count = await prisma.problem.count({ where: { id: { in: unique }, OR: [{ createdBy: req.user?.id || '' }, { isGlobal: true, status: 'PUBLISHED' }] } });
    if (count !== unique.length) return void res.status(403).json({ success: false, error: { message: 'Choose your own problems or published practice problems' } });
    next();
  } catch (error) { next(error); }
};
