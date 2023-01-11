import numpy as np

l12 = 1
l23 = 0.5
l31 = 3

# Задаємо початкові стани
T = np.zeros(3)

# Моделюємо перехід між станами
for i in range(100000):
    var = i % 3
    if var == 0:
        T[var] -= np.log(np.random.rand()) / l12
    elif var == 1:
        T[var] -= np.log(np.random.rand()) / l23
    elif var == 2:
        T[var] -= np.log(np.random.rand()) / l31

print("Теорія")
p1 = 1/(1 + l12/l23 + l12/l31)
p2 = (l12*p1)/l23
p3 = (l12*p1)/l31
print("p1 =", p1)
print("p2 =", p2)
print("p3 =", p3)

print("Практика")
print("p1 =", T[0]/sum(T))
print("p2 =", T[1]/sum(T))
print("p3 =", T[2]/sum(T))
