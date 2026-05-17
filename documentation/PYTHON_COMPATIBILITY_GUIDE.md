# Python Compatibility Guide for Judge0

## The Issue

Judge0 uses Python 3.8, which doesn't support the modern type hint syntax introduced in Python 3.9+.

### Error Example
```
TypeError: 'type' object is not subscriptable
```

This happens when using modern syntax like `list[str]` instead of `List[str]`.

---

## Quick Fix

### ❌ Wrong (Python 3.9+ syntax)
```python
class Solution:
    def reverseString(self, s: list[str]) -> None:
        s.reverse()
```

### ✅ Correct (Python 3.8 compatible)
```python
from typing import List

class Solution:
    def reverseString(self, s: List[str]) -> None:
        s.reverse()
```

---

## Common Type Conversions

| Modern (3.9+) | Compatible (3.8) | Import Needed |
|---------------|------------------|---------------|
| `list[int]` | `List[int]` | `from typing import List` |
| `dict[str, int]` | `Dict[str, int]` | `from typing import Dict` |
| `tuple[int, str]` | `Tuple[int, str]` | `from typing import Tuple` |
| `set[str]` | `Set[str]` | `from typing import Set` |
| `list[list[int]]` | `List[List[int]]` | `from typing import List` |
| `dict[str, list[int]]` | `Dict[str, List[int]]` | `from typing import Dict, List` |
| `int \| None` | `Optional[int]` | `from typing import Optional` |
| `int \| str` | `Union[int, str]` | `from typing import Union` |

---

## Complete Examples

### Example 1: Two Sum
```python
from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []
```

### Example 2: Reverse String
```python
from typing import List

class Solution:
    def reverseString(self, s: List[str]) -> None:
        """
        Do not return anything, modify s in-place instead.
        """
        left, right = 0, len(s) - 1
        while left < right:
            s[left], s[right] = s[right], s[left]
            left += 1
            right -= 1
```

### Example 3: Valid Parentheses
```python
from typing import Dict

class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping: Dict[str, str] = {')': '(', '}': '{', ']': '['}
        
        for char in s:
            if char in mapping:
                top = stack.pop() if stack else '#'
                if mapping[char] != top:
                    return False
            else:
                stack.append(char)
        
        return not stack
```

### Example 4: Nested Lists
```python
from typing import List

class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        result: List[List[int]] = []
        
        for i in range(numRows):
            row = [1] * (i + 1)
            for j in range(1, i):
                row[j] = result[i-1][j-1] + result[i-1][j]
            result.append(row)
        
        return result
```

### Example 5: Optional Return
```python
from typing import Optional

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def searchBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:
        if not root:
            return None
        if root.val == val:
            return root
        elif val < root.val:
            return self.searchBST(root.left, val)
        else:
            return self.searchBST(root.right, val)
```

### Example 6: Union Types
```python
from typing import Union, List

class Solution:
    def process(self, data: Union[int, str, List[int]]) -> str:
        if isinstance(data, int):
            return str(data)
        elif isinstance(data, str):
            return data
        else:
            return ','.join(map(str, data))
```

---

## All Typing Imports

```python
from typing import (
    List,           # list[T]
    Dict,           # dict[K, V]
    Set,            # set[T]
    Tuple,          # tuple[T, ...]
    Optional,       # T | None
    Union,          # T | U
    Any,            # any type
    Callable,       # function type
    Iterable,       # iterable type
    Iterator,       # iterator type
    Sequence,       # sequence type
    Mapping,        # mapping type
)
```

---

## Problem Templates

### Array/List Problems
```python
from typing import List

class Solution:
    def solveProblem(self, nums: List[int]) -> List[int]:
        # Your solution here
        pass
```

### String Problems
```python
class Solution:
    def solveProblem(self, s: str) -> str:
        # Your solution here
        pass
```

### Matrix Problems
```python
from typing import List

class Solution:
    def solveProblem(self, matrix: List[List[int]]) -> List[List[int]]:
        # Your solution here
        pass
```

### Tree Problems
```python
from typing import Optional

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def solveProblem(self, root: Optional[TreeNode]) -> int:
        # Your solution here
        pass
```

### Graph Problems
```python
from typing import List, Dict, Set

class Solution:
    def solveProblem(self, graph: List[List[int]]) -> bool:
        # Your solution here
        pass
```

---

## Testing Your Code

### Local Testing (Python 3.8)

```bash
# Install Python 3.8
pyenv install 3.8.18
pyenv local 3.8.18

# Test your code
python solution.py
```

### Online Testing

Use Judge0 directly:
```bash
curl -X POST "https://judge0-ce.p.rapidapi.com/submissions" \
  -H "content-type: application/json" \
  -H "x-rapidapi-key: YOUR_KEY" \
  -d '{
    "source_code": "from typing import List\n\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        return [0, 1]",
    "language_id": 71,
    "stdin": ""
  }'
```

---

## Best Practices

### 1. Always Import Types
```python
from typing import List, Dict, Optional
```

### 2. Use Type Hints Consistently
```python
def helper(nums: List[int], target: int) -> bool:
    pass
```

### 3. Document Complex Types
```python
from typing import List, Tuple

# Returns list of (index, value) tuples
def process(nums: List[int]) -> List[Tuple[int, int]]:
    pass
```

### 4. Avoid Type Hints If Unsure
```python
# If you're not sure about types, omit them
def process(nums):
    pass
```

---

## Common Mistakes

### Mistake 1: Using Modern Syntax
```python
# ❌ Wrong
def solve(nums: list[int]) -> list[int]:
    pass

# ✅ Correct
from typing import List
def solve(nums: List[int]) -> List[int]:
    pass
```

### Mistake 2: Forgetting Imports
```python
# ❌ Wrong
def solve(nums: List[int]) -> List[int]:
    pass

# ✅ Correct
from typing import List
def solve(nums: List[int]) -> List[int]:
    pass
```

### Mistake 3: Using Union Operator
```python
# ❌ Wrong (Python 3.10+)
def solve(x: int | None) -> str:
    pass

# ✅ Correct
from typing import Optional
def solve(x: Optional[int]) -> str:
    pass
```

---

## Platform Integration

### Update Problem Templates

When creating problems, provide Python 3.8 compatible templates:

```python
from typing import List

class Solution:
    def problemName(self, param: List[int]) -> int:
        # Write your solution here
        pass
```

### Add Compatibility Note

In problem descriptions, add:

```
Note for Python users: Use `from typing import List` instead of `list[int]`
for Python 3.8 compatibility with Judge0.
```

---

## Future Considerations

### When Judge0 Updates to Python 3.9+

You can then use modern syntax:
```python
def solve(nums: list[int]) -> list[int]:
    pass
```

### Supporting Both Versions

Use conditional imports:
```python
import sys

if sys.version_info >= (3, 9):
    # Modern syntax
    def solve(nums: list[int]) -> list[int]:
        pass
else:
    # Compatible syntax
    from typing import List
    def solve(nums: List[int]) -> List[int]:
        pass
```

---

## Quick Reference Card

```python
# Essential imports for most problems
from typing import List, Dict, Set, Tuple, Optional

# Common patterns
nums: List[int]                    # Array of integers
matrix: List[List[int]]            # 2D array
mapping: Dict[str, int]            # Hash map
result: Optional[int]              # Can be None
pairs: List[Tuple[int, int]]       # List of pairs
```

---

## Summary

✅ **Always use** `from typing import List, Dict, etc.`  
✅ **Never use** modern syntax like `list[int]`  
✅ **Test locally** with Python 3.8 if possible  
✅ **Update templates** to use compatible syntax  

This ensures your code works perfectly with Judge0! 🐍

---

**Document Version**: 1.0.0  
**Last Updated**: November 16, 2024  
**Python Version**: 3.8 (Judge0 Compatible)
