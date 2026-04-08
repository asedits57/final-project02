import os
import re

replacements = [
    (r'@shared/apiClient', '@services/apiClient'),
    (r'@shared/api', '@services/apiService'),
    (r'@shared/questionService', '@services/questionService'),
    (r'@core/authService', '@services/authService'),
    (r'@core/userService', '@services/userService'),
    (r'@modules/ai/aiService', '@services/aiService'),
    (r'@/core/useAuthStore', '@store/useAuthStore'),
    (r'@core/useAuthStore', '@store/useAuthStore'),
    (r'@/shared/apiClient', '@services/apiClient'),
    (r'@/shared/api', '@services/apiService'),
    (r'@/shared/questionService', '@services/questionService'),
    (r'@shared/hooks/', '@hooks/'),
    (r'@shared/lib/', '@lib/'),
    (r'@shared/utils/', '@utils/'),
    (r'@shared/components/ui/', '@components/ui/'),
    (r'@shared/components/task/', '@components/task/'),
    (r'@shared/components/leaderboard/', '@components/leaderboard/'),
    (r'@/shared/components/task/', '@components/task/'),
    (r'@/shared/components/ui/', '@components/ui/'),
    (r'@shared/components/shared/', '@components/shared/'),
    (r'@/exam-guardian/components/', '@components/exam/'),
    (r'@/exam-guardian/pages/', '@pages/'),
    (r'@/modules/ai/pages/', '@pages/'),
    (r'@/modules/exam/pages/', '@pages/'),
    (r'@/modules/learning/pages/', '@pages/'),
    (r'@/shared/pages/', '@pages/'),
    (r'@/core/pages/', '@pages/'),
    (r'@core/components/', '@components/shared/'),
    # Specific component fixes for those moved to shared
    (r'@components/FloatingWord', '@components/shared/FloatingWord'),
    (r'@components/AnimatedBackground', '@components/shared/AnimatedBackground'),
    (r'@components/Login', '@components/shared/Login'),
    (r'@components/NavLink', '@components/shared/NavLink'),
    (r'@components/ErrorBoundary', '@components/shared/ErrorBoundary'),
    (r'@/store/useStore', '@store/useAuthStore'),
]

# Compile patterns
compiled_replacements = [(re.compile(re.escape(old)), new) for old, new in replacements]

src_dir = 'src'

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for pattern, subst in compiled_replacements:
                new_content = pattern.sub(subst, new_content)
            
            if new_content != content:
                print(f"Updating imports in {file_path}")
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)

print("Bulk import update completed.")
