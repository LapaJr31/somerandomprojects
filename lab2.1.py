import numpy as np

# Встановлюємо параметр експоненційного розподілу
lambda_param = 2

# Генеруємо 5000 випадкових значень з експоненційного розподілу
values = np.random.exponential(scale=1/lambda_param, size=5000)

# Обчислюємо експериментальне математичне очікування
exp_mean = np.mean(values)

# Обчислюємо середнє квадратичне відхилення
rmsd = np.sqrt(np.mean(np.square(values - exp_mean)))

# Обчислюємо теоретичне математичне очікування
theor_mean = 1 / lambda_param

# Виводимо експериментальні та теоретичні значення
print("Експериментальне середнє: ", exp_mean)
print("Теоретичне середнє: ", theor_mean)
print("Середнє квадратичне відхилення: ", rmsd)
