import ast
import operator
from copy import deepcopy

import numpy as np
import albumentations as A

from torch.utils.data import Dataset

from mlcomp.utils.config import parse_albu_short
from mlcomp.utils.torch import infer
from mlcomp.worker.executors import Executor

_OP_MAP = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Invert: operator.neg,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow
}


@Executor.register
class Equation(Executor, ast.NodeVisitor):
    # noinspection PyTypeChecker
    def __init__(self, equations: dict, target: str, name: str):
        self.equations = equations
        self.target = self.solve(target)
        self.name = self.solve(name)

    def tta(self, x: Dataset, tfms=()):
        x = deepcopy(x)
        transforms = getattr(x, 'transforms')
        if not transforms:
            return x
        assert isinstance(transforms, A.Compose), \
            'only Albumentations transforms are supported'
        index = len(transforms.transforms)
        for i, t in enumerate(transforms.transforms):
            if isinstance(t, A.Normalize):
                index = i
                break
        for i, t in enumerate(tfms):
            t = parse_albu_short(t, always_apply=True)
            transforms.transforms.insert(index+i, t)
        return x

    @staticmethod
    def encode(v):
        if isinstance(v, str):
            return f'\'{v}\''
        return str(v)

    @staticmethod
    def split(equations: str):
        # noinspection PyTypeChecker
        return dict(
            [
                row.strip().replace(' ', '').split(':')
                for row in equations.split('\n') if ':' in row
            ]
        )

    def load(self, file: str, type: str = 'numpy'):
        if type == 'numpy':
            return np.load(file)

        raise Exception(f'Unknown load type = {type}')

    def torch(
        self,
        x: Dataset,
        file: str,
        batch_size: int = 1,
        use_logistic: bool = True,
        num_workers: int = 1
    ):
        file = f'models/{file}'
        return infer(
            x=x,
            file=file,
            batch_size=batch_size,
            use_logistic=use_logistic,
            num_workers=num_workers
        )

    def visit_BinOp(self, node):
        left = self.visit(node.left)
        right = self.visit(node.right)
        return _OP_MAP[type(node.op)](left, right)

    def visit_Name(self, node):
        name = node.id
        if name in self.equations:
            return self.solve(self.equations[name])
        attr = getattr(self, name, None)
        if attr:
            return attr
        return str(name)

    def visit_Num(self, node):
        return node.n

    def visit_Str(self, node):
        return node.s

    def visit_Expr(self, node):
        return self.visit(node.value)

    def visit_pow(self, node):
        return node

    def visit_NameConstant(self, node):
        return node.value

    def get_value(self, node):
        t = type(node)
        if t == ast.NameConstant:
            return node.value
        if t == ast.Name:
            return self.visit_Name(node)
        if t == ast.Str:
            return node.s
        if t == ast.Name:
            return node.id
        if t == ast.Num:
            return node.n
        if t == ast.List:
            res = []
            for e in node.elts:
                res.append(self.get_value(e))
            return res
        raise Exception(f'Unknown type {t}')

    def visit_Call(self, node):
        name = node.func.id
        f = getattr(self, name)
        if not f:
            raise Exception(f'Equation class does not contain method = {name}')

        args = [self.get_value(a) for a in node.args]
        kwargs = {k.arg: self.get_value(k.value) for k in node.keywords}
        return f(*args, **kwargs)

    def solve(self, equation):
        if equation is None:
            return None
        equation = str(equation)
        tree = ast.parse(equation)
        if len(tree.body) == 0:
            return None
        calc = self
        res = calc.visit(tree.body[0])
        return res

    def work(self) -> dict:
        res = self.solve(self.equations[self.target])
        return {'res': res}


__all__ = ['Equation']